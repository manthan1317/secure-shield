import { NextRequest, NextResponse } from "next/server";
import { encrypt, decrypt } from "@/lib/encryption";
import dbConnect from "@/lib/dbConnect";
import { Credential } from "@/lib/models/credential";

// GET: Retrieve a credential by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // For demonstration, we'll use a hardcoded user ID
    // In a real app, you would get the user ID from your authentication system
    const userId = "demo-user";
    const { id } = params;
    const searchParams = new URL(req.url).searchParams;
    const masterPassword = searchParams.get("masterPassword");

    if (!masterPassword) {
      return NextResponse.json(
        { error: "Master password required" },
        { status: 400 }
      );
    }

    await dbConnect();
    const credential = await Credential.findOne({ _id: id, userId });

    if (!credential) {
      return NextResponse.json(
        { error: "Credential not found" },
        { status: 404 }
      );
    }

    try {
      // Decrypt the sensitive data
      const decryptedData = JSON.parse(
        decrypt(credential.encryptedData, masterPassword)
      );

      // Convert Mongoose document to plain object
      const credentialObj = credential.toObject();

      return NextResponse.json({
        ...credentialObj,
        ...decryptedData,
        encryptedData: undefined,
      });
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid master password" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error retrieving credential:", error);
    return NextResponse.json(
      { error: "Failed to retrieve credential" },
      { status: 500 }
    );
  }
}

// PATCH/PUT: Update a credential
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // For demonstration, we'll use a hardcoded user ID
    // In a real app, you would get the user ID from your authentication system
    const userId = "demo-user";
    const { id } = params;
    const body = await req.json();
    const { type, title, masterPassword, ...data } = body;

    if (!type || !title || !masterPassword) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();
    const credential = await Credential.findOne({ _id: id, userId });

    if (!credential) {
      return NextResponse.json(
        { error: "Credential not found" },
        { status: 404 }
      );
    }

    // Encrypt the updated data
    const encryptedData = encrypt(JSON.stringify(data), masterPassword);

    // Update the credential
    credential.type = type;
    credential.title = title;
    credential.encryptedData = encryptedData;
    credential.lastModified = new Date();

    await credential.save();
    return NextResponse.json(credential);
  } catch (error) {
    console.error("Error updating credential:", error);
    return NextResponse.json(
      { error: "Failed to update credential" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a credential
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // For demonstration, we'll use a hardcoded user ID
    // In a real app, you would get the user ID from your authentication system
    const userId = "demo-user";
    const { id } = params;

    await dbConnect();
    const result = await Credential.deleteOne({ _id: id, userId });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Credential not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting credential:", error);
    return NextResponse.json(
      { error: "Failed to delete credential" },
      { status: 500 }
    );
  }
}

// Support for PUT method
export { PATCH as PUT };
