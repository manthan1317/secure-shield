import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongo";

export async function POST(request) {
  try {
    console.log("Login API called");

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
    const usersCollection = db.collection("users");

    // Find user by email
    console.log("Finding user by email:", email);
    const user = await usersCollection.findOne({ email });

    // Check if user exists
    if (!user) {
      console.log("No user found with email:", email);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Compare passwords
    console.log("Comparing passwords...");
    let isPasswordValid = false;
    try {
      isPasswordValid = await bcrypt.compare(password, user.password);
    } catch (passwordError) {
      console.error("Password comparison error:", passwordError);
      return NextResponse.json(
        { error: "Authentication error" },
        { status: 500 }
      );
    }

    if (!isPasswordValid) {
      console.log("Invalid password for user:", email);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    console.log("Login successful for user:", email);

    // Remove password from user object and convert ObjectId to string
    const userWithoutPassword = {
      _id: user._id.toString(), // Convert MongoDB ObjectId to string
      name: user.name,
      email: user.email,
      // Add other user fields as needed
    };

    // Return user information
    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user: userWithoutPassword,
      },
      { status: 200 }
    );
  } catch (serverError) {
    console.error("Login error details:", serverError);
    // Log the full error stack for debugging
    console.error("Error stack:", serverError.stack);

    return NextResponse.json(
      { error: "Internal server error", message: serverError.message },
      { status: 500 }
    );
  }
}
