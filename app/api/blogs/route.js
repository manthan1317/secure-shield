import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongo";

// GET handler to fetch all blogs - public endpoint
export async function GET(request) {
  try {
    console.log("Fetching all blogs for public view");

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

    // Get pagination parameters from URL
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Fetch blogs with pagination, sorted by date (newest first)
    const blogs = await blogsCollection
      .find({})
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get total count for pagination
    const total = await blogsCollection.countDocuments({});

    // Convert ObjectId to string for each blog
    const serializedBlogs = blogs.map((blog) => ({
      ...blog,
      _id: blog._id.toString(),
      // Remove internal fields from public view
      createdBy: undefined,
      updatedBy: undefined,
    }));

    return NextResponse.json(
      {
        blogs: serializedBlogs,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
