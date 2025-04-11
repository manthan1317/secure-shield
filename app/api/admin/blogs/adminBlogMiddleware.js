import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongo";

// This middleware verifies that the request is from an authenticated admin
export async function authenticateAdmin(req) {
  try {
    // Get the admin auth cookie
    const adminAuthCookie = req.cookies.get("adminAuth")?.value;

    if (!adminAuthCookie) {
      return {
        success: false,
        response: NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        ),
      };
    }

    // Decode the admin data from the cookie
    let adminData;
    try {
      // Use atob for base64 decoding
      const decodedData = atob(adminAuthCookie);
      adminData = JSON.parse(decodedData);
    } catch (error) {
      console.error("Failed to decode admin auth cookie:", error);
      return {
        success: false,
        response: NextResponse.json(
          { error: "Invalid authentication" },
          { status: 401 }
        ),
      };
    }

    // Validate the admin data
    if (
      !adminData ||
      !adminData._id ||
      !adminData.email ||
      adminData.role !== "admin"
    ) {
      return {
        success: false,
        response: NextResponse.json(
          { error: "Invalid or insufficient permissions" },
          { status: 403 }
        ),
      };
    }

    // Verify admin in database (optional extra security check)
    const clientPromiseResult = await clientPromise;
    if (!clientPromiseResult) {
      console.error("Failed to connect to MongoDB for admin verification");
      return {
        success: false,
        response: NextResponse.json(
          { error: "Database connection failed" },
          { status: 500 }
        ),
      };
    }

    const client = clientPromiseResult;
    const db = client.db("secure-shield");
    const adminsCollection = db.collection("admins");

    // Find admin by email
    const admin = await adminsCollection.findOne({
      email: adminData.email,
      role: "admin",
    });

    if (!admin) {
      return {
        success: false,
        response: NextResponse.json(
          { error: "Admin account not found" },
          { status: 403 }
        ),
      };
    }

    return {
      success: true,
      admin: adminData,
    };
  } catch (error) {
    console.error("Admin authentication error:", error);
    return {
      success: false,
      response: NextResponse.json(
        { error: "Authentication error", message: error.message },
        { status: 500 }
      ),
    };
  }
}
