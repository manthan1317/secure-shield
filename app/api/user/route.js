import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongo";
import { ObjectId } from "mongodb";

export async function GET(request) {
  try {
    console.log("User API called");

    // Get the auth cookie from the request
    const cookies = request.cookies;
    const authCookie = cookies.get("auth");

    if (!authCookie || !authCookie.value) {
      console.log("No auth cookie found");
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    console.log("Auth cookie found");

    // Decode the base64 encoded user data
    const encodedUserData = authCookie.value;
    let userData;
    try {
      // Use Buffer for server-side base64 decoding
      console.log("Attempting to decode auth cookie");
      const decodedUserData = Buffer.from(encodedUserData, "base64").toString(
        "utf-8"
      );
      userData = JSON.parse(decodedUserData);
      console.log("Auth cookie decoded successfully", { userId: userData._id });
    } catch (decodeError) {
      console.error("Failed to decode auth cookie:", decodeError);
      return NextResponse.json(
        { error: "Invalid authentication data" },
        { status: 401 }
      );
    }

    // If we have an ID, fetch the latest user data from the database
    if (userData && userData._id) {
      try {
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

        // Convert string ID to ObjectId if needed
        console.log("Converting ID to ObjectId if needed");
        let userId;
        try {
          userId =
            typeof userData._id === "string" && userData._id.length === 24
              ? new ObjectId(userData._id)
              : userData._id;
          console.log("User ID processed:", userId);
        } catch (idError) {
          console.error("Error converting ID to ObjectId:", idError);
          // If there's an error with the ID, fall back to using cookie data
          return NextResponse.json({
            success: true,
            user: {
              ...userData,
              avatar:
                userData.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  userData.name
                )}&background=random`,
            },
          });
        }

        // Find user by ID
        console.log("Finding user by ID");
        const user = await usersCollection.findOne(
          { _id: userId },
          { projection: { password: 0 } } // Exclude password
        );

        if (user) {
          console.log("User found in database");
          return NextResponse.json({
            success: true,
            user: {
              _id: user._id.toString(), // Convert ObjectId to string
              name: user.name,
              email: user.email,
              // Include avatar URL or provide a default
              avatar:
                user.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user.name
                )}&background=random`,
            },
          });
        } else {
          console.log("User not found in database");
        }
      } catch (dbError) {
        console.error("Database error:", dbError);
        console.error("Database error stack:", dbError.stack);
        // Fall through to use cookie data if database lookup fails
      }
    }

    // If we don't have an ID, can't find the user in the database, or there was an error
    // return the data from the cookie
    console.log("Falling back to cookie data");
    return NextResponse.json({
      success: true,
      user: {
        ...userData,
        // Generate avatar URL if not present
        avatar:
          userData.avatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            userData.name
          )}&background=random`,
      },
    });
  } catch (serverError) {
    console.error("Error fetching user data:", serverError);
    console.error("Error stack:", serverError.stack);
    return NextResponse.json(
      { error: "Internal server error", message: serverError.message },
      { status: 500 }
    );
  }
}
