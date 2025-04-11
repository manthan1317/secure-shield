"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styled from "styled-components";
import { ArrowLeft } from "lucide-react";

interface BlogDetailProps {
  id: string;
}

interface BlogData {
  _id: string;
  title: string;
  image: string;
  date: string;
  readingTime: string;
  author: string;
  description1: string;
  description2?: string;
  description3?: string;
}

export default function BlogDetail({ id }: BlogDetailProps) {
  const [blog, setBlog] = useState<BlogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBlogDetail() {
      try {
        setLoading(true);
        console.log(`Fetching blog with ID: ${id}`);
        const response = await fetch(`/api/blogs/${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Blog not found");
          }
          throw new Error("Failed to fetch blog details");
        }

        const data = await response.json();
        console.log("Fetched blog detail:", data);

        if (!data || !data.title) {
          throw new Error("Invalid blog data received");
        }

        setBlog(data);
      } catch (err) {
        console.error("Error fetching blog detail:", err);
        setError(
          (err as Error).message ||
            "Could not load blog details. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchBlogDetail();
    } else {
      setError("Invalid blog ID");
      setLoading(false);
    }
  }, [id]);

  return (
    <BlogDetailContainer>
      <Link href="/" className="back-link">
        <ArrowLeft size={20} />
        <span>Back to Blogs</span>
      </Link>

      {loading && <LoadingMessage>Loading blog details...</LoadingMessage>}
      {error && (
        <ErrorContainer>
          <ErrorMessage>{error}</ErrorMessage>
          <Link href="/" className="return-link">
            Return to blogs list
          </Link>
        </ErrorContainer>
      )}

      {blog && (
        <BlogContent>
          <BlogHeader>
            <h1>{blog.title}</h1>
            <BlogMeta>
              <span className="author">By {blog.author}</span>
              <span className="date">
                {new Date(blog.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span className="reading-time">{blog.readingTime} read</span>
            </BlogMeta>
          </BlogHeader>

          {blog.image && (
            <BlogImage>
              <img
                src={blog.image}
                alt={blog.title}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://placehold.co/1200x400/darkgray/white?text=Secure+Shield";
                }}
              />
            </BlogImage>
          )}

          <BlogBody>
            <p className="description">{blog.description1}</p>

            {blog.description2 && blog.description2.trim() !== "" && (
              <p className="description">{blog.description2}</p>
            )}

            {blog.description3 && blog.description3.trim() !== "" && (
              <p className="description">{blog.description3}</p>
            )}
          </BlogBody>
        </BlogContent>
      )}
    </BlogDetailContainer>
  );
}

const BlogDetailContainer = styled.div`
  color: var(--white-smoke);
  width: 100%;

  .back-link {
    display: inline-flex;
    align-items: center;
    color: var(--white-smoke);
    margin-bottom: 40px;
    text-decoration: none;
    transition: opacity 0.3s ease;

    span {
      margin-left: 8px;
      font-family: font1;
    }

    &:hover {
      opacity: 0.8;
    }
  }
`;

const LoadingMessage = styled.div`
  color: var(--white-smoke);
  font-size: 18px;
  text-align: center;
  margin: 2rem 0;
`;

const ErrorContainer = styled.div`
  text-align: center;
  margin: 4rem 0;

  .return-link {
    display: inline-block;
    margin-top: 20px;
    color: var(--white-smoke);
    text-decoration: underline;
    font-family: font1;
    transition: opacity 0.3s ease;

    &:hover {
      opacity: 0.8;
    }
  }
`;

const ErrorMessage = styled.div`
  color: #ff5555;
  font-size: 18px;
  text-align: center;
  margin: 2rem 0;
`;

const BlogContent = styled.article`
  max-width: 1000px;
  margin: 0 auto;
`;

const BlogHeader = styled.header`
  margin-bottom: 40px;

  h1 {
    font-family: font2-300;
    font-size: 42px;
    line-height: 1.3;
    color: var(--white-smoke);
    margin-bottom: 20px;
  }

  @media (max-width: 768px) {
    h1 {
      font-size: 32px;
    }
  }
`;

const BlogMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  font-family: font1;
  font-size: 14px;
  color: var(--white-smoke);
  opacity: 0.8;

  .author {
    font-weight: bold;
  }
`;

const BlogImage = styled.div`
  width: 100%;
  height: 400px;
  margin-bottom: 40px;
  border-radius: 8px;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.05);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media (max-width: 768px) {
    height: 300px;
  }
`;

const BlogBody = styled.div`
  font-family: font1;
  font-size: 18px;
  line-height: 1.8;
  color: var(--white-smoke);

  .description {
    margin-bottom: 30px;
  }

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;
