"use client";

import { useParams } from "next/navigation";
import styled from "styled-components";
import BlogDetail from "@/components/BlogDetail";

export default function BlogDetailPage() {
  const { id } = useParams();
  const blogId = Array.isArray(id) ? id[0] : id;

  return (
    <BlogDetailPageContainer>
      <BlogDetail id={blogId} />
    </BlogDetailPageContainer>
  );
}

const BlogDetailPageContainer = styled.div`
  min-height: 100vh;
  padding: 80px 150px;

  @media (max-width: 768px) {
    padding: 60px 20px;
  }
`;
