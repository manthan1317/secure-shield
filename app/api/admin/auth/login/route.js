import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongo";

export async function POST(request) {
  try {
    console.log("Admin login API called");

    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log("Request body parsed:", {
        email: body.email,
        hasPassword: !!body.password,
      });
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      console.log("Missing required fields", {
        hasEmail: !!email,
        hasPassword: !!password,
      });
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    const clientPromiseResult = await clientPromise;

    if (!clientPromiseResult) {
      console.error(
        "Failed to connect to MongoDB: Connection promise resolved to null"
      );
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    const client = clientPromiseResult;
    console.log("MongoDB connection successful");

    const db = client.db("secure-shield");
    const adminsCollection = db.collection("admins");

    // Find admin by email
    console.log("Finding admin by email:", email);
    const admin = await adminsCollection.findOne({ email });

    // Check if admin exists
    if (!admin) {
      console.log("No admin found with email:", email);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify the user is an admin
    if (admin.role !== "admin") {
      console.log("User is not an admin:", email);
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Compare passwords
    console.log("Comparing passwords...");
    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(password, admin.password);
    } catch (passwordError) {
      console.error("Password comparison error:", passwordError);
      return NextResponse.json(
        { error: "Authentication error" },
        { status: 500 }
      );
    }

    if (!isPasswordValid) {
      console.log("Invalid password for admin:", email);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    console.log("Login successful for admin:", email);

    // Remove password from admin object and convert ObjectId to string
    const adminWithoutPassword = {
      _id: admin._id.toString(),
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };

    // Return admin information
    return NextResponse.json(
      {
        success: true,
        message: "Admin login successful",
        user: adminWithoutPassword,
      },
      { status: 200 }
    );
  } catch (serverError) {
    console.error("Admin login error details:", serverError);
    console.error("Error stack:", serverError.stack);

    return NextResponse.json(
      { error: "Internal server error", message: serverError.message },
      { status: 500 }
    );
  }
}
