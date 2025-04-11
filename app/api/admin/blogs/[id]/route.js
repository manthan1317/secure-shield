import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongo";
import { ObjectId } from "mongodb";
import { authenticateAdmin } from "../adminBlogMiddleware";

// GET handler to fetch a specific blog by ID
export async function GET(request, { params }) {
  try {
    // Authenticate admin
    const auth = await authenticateAdmin(request);
    if (!auth.success) {
      return auth.response;
    }

    const { id } = params;
    console.log(`Fetching blog with ID: ${id}`);

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

    // Convert ObjectId to string
    const serializedBlog = {
      ...blog,
      _id: blog._id.toString(),
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

// PUT handler to update a blog by ID
export async function PUT(request, { params }) {
  try {
    // Authenticate admin
    const auth = await authenticateAdmin(request);
    if (!auth.success) {
      return auth.response;
    }

    const { id } = params;
    console.log(`Updating blog with ID: ${id}`);

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid blog ID" }, { status: 400 });
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Validate required fields
    const { title, image, author, description1 } = body;

    if (!title || !image || !author || !description1) {
      return NextResponse.json(
        {
          error:
            "Title, image, author and at least first description are required",
        },
        { status: 400 }
      );
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

    // Check if blog exists
    const existingBlog = await blogsCollection.findOne({
      _id: new ObjectId(id),
    });
    if (!existingBlog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // Prepare update object
    const updateData = {
      ...body,
      updatedAt: new Date().toISOString(),
      updatedBy: auth.admin._id, // Track which admin updated the blog
    };

    // Update the blog
    const result = await blogsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (!result.acknowledged) {
      console.error("Failed to update blog:", result);
      return NextResponse.json(
        { error: "Failed to update blog" },
        { status: 500 }
      );
    }

    // Get the updated blog
    const updatedBlog = await blogsCollection.findOne({
      _id: new ObjectId(id),
    });

    // Convert ObjectId to string
    const serializedBlog = {
      ...updatedBlog,
      _id: updatedBlog._id.toString(),
    };

    return NextResponse.json(serializedBlog, { status: 200 });
  } catch (error) {
    console.error(`Error updating blog with ID ${params?.id}:`, error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}

// DELETE handler to delete a blog by ID
export async function DELETE(request, { params }) {
  try {
    // Authenticate admin
    const auth = await authenticateAdmin(request);
    if (!auth.success) {
      return auth.response;
    }

    const { id } = params;
    console.log(`Deleting blog with ID: ${id}`);

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

    // Check if blog exists
    const existingBlog = await blogsCollection.findOne({
      _id: new ObjectId(id),
    });
    if (!existingBlog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // Delete the blog
    const result = await blogsCollection.deleteOne({ _id: new ObjectId(id) });

    if (!result.acknowledged || result.deletedCount !== 1) {
      console.error("Failed to delete blog:", result);
      return NextResponse.json(
        { error: "Failed to delete blog" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Blog deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error deleting blog with ID ${params?.id}:`, error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
