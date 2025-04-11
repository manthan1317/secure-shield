import { NextRequest, NextResponse } from "next/server";
import { encrypt } from "@/lib/encryption";
import dbConnect from "@/lib/dbConnect";
import { Credential } from "@/lib/models/credential";

// GET: Retrieve all credentials for the current user
export async function GET(req: NextRequest) {
  try {
    // For demonstration, we'll use a hardcoded user ID
    // In a real app, you would get the user ID from your authentication system
    const userId = "demo-user";

    await dbConnect();
    const credentials = await Credential.find({ userId }).sort({
      lastModified: -1,
    });

    return NextResponse.json(credentials);
  } catch (error) {
    console.error("Error fetching credentials:", error);
    return NextResponse.json(
      { error: "Failed to retrieve credentials" },
      { status: 500 }
    );
  }
}

// POST: Create a new credential
export async function POST(req: NextRequest) {
  try {
    // For demonstration, we'll use a hardcoded user ID
    // In a real app, you would get the user ID from your authentication system
    const userId = "demo-user";

    const body = await req.json();
    const { type, title, masterPassword, ...data } = body;

    if (!type || !title || !masterPassword) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Encrypt the sensitive data
    const encryptedData = encrypt(JSON.stringify(data), masterPassword);

    await dbConnect();
    const newCredential = new Credential({
      userId,
      type,
      title,
      encryptedData,
      lastModified: new Date(),
    });

    await newCredential.save();
    return NextResponse.json(newCredential);
  } catch (error) {
    console.error("Error creating credential:", error);
    return NextResponse.json(
      { error: "Failed to create credential" },
      { status: 500 }
    );
  }
}
