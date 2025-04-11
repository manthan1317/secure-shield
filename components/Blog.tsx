import Link from "next/link";
import styled from "styled-components";
import { useState, useEffect } from "react";

interface BlogType {
  _id: string;
  title: string;
  image: string;
  date: string;
  readingTime: string;
  author: string;
  description1: string;
}

interface BlogResponse {
  blogs: BlogType[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function Blogs() {
  const [blogs, setBlogs] = useState<BlogType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        setLoading(true);
        const response = await fetch("/api/blogs");
        if (!response.ok) {
          throw new Error("Failed to fetch blogs");
        }
        const data: BlogResponse = await response.json();
        console.log("Fetched blog data:", data); // For debugging

        if (data.blogs) {
          setBlogs(data.blogs);
        } else {
          console.error("No blogs found in response:", data);
          setError("Could not load blogs. Unexpected response format.");
        }
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setError("Could not load blogs. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchBlogs();
  }, []);

  return (
    <BlogContainer>
      <h4>Informative blogs listed by secure shield</h4>

      {loading && <LoadingMessage>Loading blogs...</LoadingMessage>}
      {error && <ErrorMessage>{error}</ErrorMessage>}

      <BlogsMain>
        {blogs && blogs.length > 0 ? (
          blogs.map((blog) => (
            <BlogsCard key={blog._id}>
              <div className="label"></div>
              <h3>{blog.title}</h3>
              <p>By {blog.author}</p>
              <h5>
                {blog.description1.length > 120
                  ? `${blog.description1.substring(0, 120)}...`
                  : blog.description1}
              </h5>
              <Link href={`/blog/${blog._id}`} className="border-bg-btn">
                Read More {blog.readingTime}
              </Link>
            </BlogsCard>
          ))
        ) : !loading && !error ? (
          <NoBlogs>
            <p>No blogs available at the moment.</p>
            <p className="small">
              Visit the admin panel to create your first blog post!
            </p>
          </NoBlogs>
        ) : null}
      </BlogsMain>
    </BlogContainer>
  );
}

const BlogContainer = styled.div`
  padding: 100px 150px;
  background-color: rgb(9, 23, 23);
  width: 100%;
  z-index: 1000;
  h4 {
    font-family: font2-300;
    color: var(--white-smoke);
    font-size: 35px;
    margin-bottom: 3rem;
  }

  @media (max-width: 768px) {
    padding: 60px 20px;

    h4 {
      font-size: 28px;
    }
  }
`;

const BlogsMain = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const BlogsCard = styled.div`
  position: relative;
  padding: 64px 48px;
  border: 1px solid var(--white-smoke);
  border-radius: 7px;

  .label {
    position: absolute;
    top: 0%;
    left: 0%;
    height: 10px;
    width: 100%;
    background-color: var(--white-smoke);
    border-top-left-radius: 7px;
    border-top-right-radius: 7px;
  }
  h3 {
    font-family: font2-300;
    font-size: 32px;
    line-height: 1.4;
    color: var(--white-smoke);
    margin-bottom: 2.5rem;
  }
  p {
    font-size: 13px;
    font-family: font1;
    color: var(--white-smoke);
    margin-bottom: 1rem;
  }
  h5 {
    font-size: 18px;
    font-family: font1;
    color: var(--white-smoke);
    margin-bottom: 3rem;
  }

  @media (max-width: 768px) {
    padding: 48px 24px;

    h3 {
      font-size: 24px;
    }

    h5 {
      font-size: 16px;
    }
  }
`;

const LoadingMessage = styled.div`
  color: var(--white-smoke);
  font-size: 18px;
  text-align: center;
  margin: 2rem 0;
`;

const ErrorMessage = styled.div`
  color: #ff5555;
  font-size: 18px;
  text-align: center;
  margin: 2rem 0;
`;

const NoBlogs = styled.div`
  color: var(--white-smoke);
  font-size: 18px;
  text-align: center;
  grid-column: 1 / -1;
  margin: 2rem 0;

  .small {
    font-size: 14px;
    opacity: 0.7;
    margin-top: 10px;
  }
`;
