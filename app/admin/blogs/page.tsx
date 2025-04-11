"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

// Blog interface
interface Blog {
  _id: string;
  title: string;
  image: string;
  date: string;
  readingTime: string;
  author: string;
  description1: string;
  description2?: string;
  description3?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminBlogsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAppSelector((state) => state.admin);
  const [isClient, setIsClient] = useState(false);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentBlog, setCurrentBlog] = useState<Blog | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit" | "view">("view");
  const [formData, setFormData] = useState({
    title: "",
    image: "",
    date: new Date().toISOString().split("T")[0],
    readingTime: "5 min",
    author: "",
    description1: "",
    description2: "",
    description3: "",
  });

  useEffect(() => {
    setIsClient(true);
    // If not authenticated, redirect to login page
    if (!isAuthenticated && typeof window !== "undefined") {
      router.push("/admin/login");
    }
  }, [isAuthenticated, router]);

  // Fetch blogs when component mounts
  useEffect(() => {
    if (isAuthenticated && isClient) {
      fetchBlogs();
    }
  }, [isAuthenticated, isClient]);

  // Fetch blogs from the API
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/blogs", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch blogs");
      }

      const data = await response.json();
      setBlogs(data);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setError((error as Error).message || "Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Create a new blog
  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/blogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create blog");
      }

      // Reset form and fetch updated blogs
      setFormData({
        title: "",
        image: "",
        date: new Date().toISOString().split("T")[0],
        readingTime: "5 min",
        author: "",
        description1: "",
        description2: "",
        description3: "",
      });
      setFormMode("view");
      await fetchBlogs();
    } catch (error) {
      console.error("Error creating blog:", error);
      setError((error as Error).message || "Failed to create blog");
    } finally {
      setLoading(false);
    }
  };

  // Update an existing blog
  const handleUpdateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBlog) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/blogs/${currentBlog._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update blog");
      }

      // Reset form and fetch updated blogs
      setFormData({
        title: "",
        image: "",
        date: new Date().toISOString().split("T")[0],
        readingTime: "5 min",
        author: "",
        description1: "",
        description2: "",
        description3: "",
      });
      setCurrentBlog(null);
      setFormMode("view");
      await fetchBlogs();
    } catch (error) {
      console.error("Error updating blog:", error);
      setError((error as Error).message || "Failed to update blog");
    } finally {
      setLoading(false);
    }
  };

  // Delete a blog
  const handleDeleteBlog = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/blogs/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete blog");
      }

      // Fetch updated blogs
      await fetchBlogs();
    } catch (error) {
      console.error("Error deleting blog:", error);
      setError((error as Error).message || "Failed to delete blog");
    } finally {
      setLoading(false);
    }
  };

  // Edit blog - populate form with blog data
  const handleEditBlog = (blog: Blog) => {
    setCurrentBlog(blog);
    setFormData({
      title: blog.title || "",
      image: blog.image || "",
      date: blog.date
        ? new Date(blog.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      readingTime: blog.readingTime || "5 min",
      author: blog.author || "",
      description1: blog.description1 || "",
      description2: blog.description2 || "",
      description3: blog.description3 || "",
    });
    setFormMode("edit");
  };

  // Show nothing during server-side rendering to prevent hydration issues
  if (!isClient) {
    return null;
  }

  // If no user or not authenticated, show loading or message
  if (!user || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="mb-6 text-3xl font-bold">Blog Management</h1>

      {error && (
        <div className="mb-4 rounded bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Blog Form */}
      {formMode !== "view" && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              {formMode === "create" ? "Create New Blog" : "Edit Blog"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={
                formMode === "create" ? handleCreateBlog : handleUpdateBlog
              }
              className="space-y-4"
            >
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="readingTime">Reading Time</Label>
                  <Input
                    id="readingTime"
                    name="readingTime"
                    value={formData.readingTime}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    name="author"
                    value={formData.author}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description1">Description 1</Label>
                <Textarea
                  id="description1"
                  name="description1"
                  value={formData.description1}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  rows={4}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description2">Description 2 (Optional)</Label>
                <Textarea
                  id="description2"
                  name="description2"
                  value={formData.description2}
                  onChange={handleInputChange}
                  disabled={loading}
                  rows={4}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description3">Description 3 (Optional)</Label>
                <Textarea
                  id="description3"
                  name="description3"
                  value={formData.description3}
                  onChange={handleInputChange}
                  disabled={loading}
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading
                    ? "Saving..."
                    : formMode === "create"
                    ? "Create Blog"
                    : "Update Blog"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormMode("view");
                    setCurrentBlog(null);
                    setFormData({
                      title: "",
                      image: "",
                      date: new Date().toISOString().split("T")[0],
                      readingTime: "5 min",
                      author: "",
                      description1: "",
                      description2: "",
                      description3: "",
                    });
                  }}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Blog List */}
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Blog Posts</h2>
        {formMode === "view" && (
          <Button onClick={() => setFormMode("create")}>Create New Blog</Button>
        )}
      </div>

      {loading && formMode === "view" ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <Skeleton className="h-16 w-24 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <div className="flex gap-2 self-start">
                    <Skeleton className="h-8 w-16 rounded" />
                    <Skeleton className="h-8 w-16 rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {blogs.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No blogs found. Create your first blog post!
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {blogs.map((blog) => (
                <Card key={blog._id}>
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="w-24 h-16 rounded bg-gray-200 overflow-hidden">
                        {blog.image && (
                          <img
                            src={blog.image}
                            alt={blog.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "https://placehold.co/96x64/gray/white?text=Image";
                            }}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{blog.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {blog.author} •{" "}
                          {new Date(blog.date).toLocaleDateString()} •{" "}
                          {blog.readingTime}
                        </p>
                        <p className="text-sm line-clamp-1 mt-1">
                          {blog.description1.substring(0, 100)}...
                        </p>
                      </div>
                      <div className="flex gap-2 self-start">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditBlog(blog)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteBlog(blog._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
