import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongo";

export async function POST(request) {
  try {
    console.log("Admin registration API called");

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

    const { name, email, password, adminCode } = body;

    // Validate required fields
    if (!name || !email || !password || !adminCode) {
      console.log("Missing required fields", {
        hasName: !!name,
        hasEmail: !!email,
        hasPassword: !!password,
        hasAdminCode: !!adminCode,
      });
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Verify admin registration code
    // In a real application, use an environment variable or secure storage for this
    const validAdminCode = process.env.ADMIN_SECRET_CODE; // Replace with actual secure code
    if (adminCode !== validAdminCode) {
      return NextResponse.json(
        { error: "Invalid admin registration code" },
        { status: 403 }
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

    // Check if admin already exists
    console.log("Checking if admin exists:", email);
    const existingAdmin = await adminsCollection.findOne({ email });

    if (existingAdmin) {
      console.log("Admin already exists:", email);
      return NextResponse.json(
        { error: "Admin with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const newAdmin = {
      name,
      email,
      password: hashedPassword,
      role: "admin",
      createdAt: new Date(),
    };

    console.log("Creating new admin:", { email, name });
    const result = await adminsCollection.insertOne(newAdmin);

    if (!result.acknowledged) {
      console.error("Failed to insert admin:", result);
      return NextResponse.json(
        { error: "Failed to create admin" },
        { status: 500 }
      );
    }

    console.log("Admin created successfully:", email);

    // Return admin information (without password)
    const adminWithoutPassword = {
      _id: result.insertedId.toString(),
      name,
      email,
      role: "admin",
    };

    return NextResponse.json(
      {
        success: true,
        message: "Admin registered successfully",
        user: adminWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin registration error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
