import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongo";
import { ObjectId } from "mongodb";
import { authenticateAdmin } from "./adminBlogMiddleware";

// GET handler to fetch all blogs
export async function GET(request) {
  try {
    // Authenticate admin
    const auth = await authenticateAdmin(request);
    if (!auth.success) {
      return auth.response;
    }

    console.log("Fetching all blogs");

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

    // Fetch all blogs, sorted by date (newest first)
    const blogs = await blogsCollection.find({}).sort({ date: -1 }).toArray();

    // Convert ObjectId to string for each blog
    const serializedBlogs = blogs.map((blog) => ({
      ...blog,
      _id: blog._id.toString(),
    }));

    return NextResponse.json(serializedBlogs, { status: 200 });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}

// POST handler to create a new blog
export async function POST(request) {
  try {
    // Authenticate admin
    const auth = await authenticateAdmin(request);
    if (!auth.success) {
      return auth.response;
    }

    console.log("Creating new blog post");

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
    const { title, image, author, description1, description2, description3 } =
      body;
    const readingTime = body.readingTime || "5 min"; // Default reading time
    const date = body.date || new Date().toISOString(); // Default to current date

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

    // Create new blog object
    const newBlog = {
      title,
      image,
      date,
      readingTime,
      author,
      description1,
      description2: description2 || "",
      description3: description3 || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: auth.admin._id, // Store the admin ID who created the blog
    };

    // Insert the blog into the database
    const result = await blogsCollection.insertOne(newBlog);

    if (!result.acknowledged) {
      console.error("Failed to insert blog:", result);
      return NextResponse.json(
        { error: "Failed to create blog" },
        { status: 500 }
      );
    }

    // Return the created blog
    const createdBlog = {
      ...newBlog,
      _id: result.insertedId.toString(),
    };

    return NextResponse.json(createdBlog, { status: 201 });
  } catch (error) {
    console.error("Error creating blog:", error);
    return NextResponse.json(
      { error: "Internal server error", message: error.message },
      { status: 500 }
    );
  }
}
