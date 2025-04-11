import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongo";

export async function POST(request) {
  try {
    console.log("Registration API called");

    // Parse request body
    let body;
    try {
      body = await request.json();
      console.log("Request body parsed:", {
        email: body.email,
        name: body.name,
        hasPassword: !!body.password,
      });
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { name, email, password } = body;

    // Validate required fields
    if (!name || !email || !password) {
      console.log("Missing required fields", {
        hasName: !!name,
        hasEmail: !!email,
        hasPassword: !!password,
      });
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("Invalid email format", { email });
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      console.log("Password too short");
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
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

    // Check if user already exists
    console.log("Checking if user exists...");
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      console.log("User already exists with email:", email);
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash the password
    console.log("Hashing password...");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user in database
    console.log("Creating new user...");
    const result = await usersCollection.insertOne({
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    console.log("User created successfully with ID:", result.insertedId);

    // Return success response without password
    return NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        user: {
          _id: result.insertedId.toString(), // Convert ObjectId to string
          name,
          email,
        },
      },
      { status: 201 }
    );
  } catch (serverError) {
    console.error("Registration error details:", serverError);
    // Log the full error stack for debugging
    console.error("Error stack:", serverError.stack);

    return NextResponse.json(
      { error: "Internal server error", message: serverError.message },
      { status: 500 }
    );
  }
}
