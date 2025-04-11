import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongo";
import { ObjectId } from "mongodb";

// GET handler to fetch a specific blog by ID - public endpoint
export async function GET(request, { params }) {
  try {
    const { id } = params;
    console.log(`Fetching blog with ID: ${id} for public view`);

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid blog ID" }, { status: 400 });
    }

    // Connect to MongoDB
    const clientPromiseResult = await clientPromise;
    if (!clientPromiseResult) {
      console.error("Failed to connect to MongoDB");
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    const client = clientPromiseResult;
    const db = client.db("secure-shield");
    const blogsCollection = db.collection("blogs");

    // Find the blog by ID
    const blog = await blogsCollection.findOne({ _id: new ObjectId(id) });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // Convert ObjectId to string and remove internal fields
    const serializedBlog = {
      ...blog,
      _id: blog._id.toString(),
      createdBy: undefined,
      updatedBy: undefined,
    };

    return NextResponse.json(serializedBlog, { status: 200 });
  } catch (error) {
    console.error(`Error fetching blog with ID ${params?.id}:`, error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
