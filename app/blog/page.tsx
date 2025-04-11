"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import styled from "styled-components";

export default function BlogIndexPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the homepage which shows all blogs
    router.push("/");
  }, [router]);

  return (
    <LoadingContainer>
      <LoadingText>Redirecting to blogs...</LoadingText>
    </LoadingContainer>
  );
}

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50vh;
`;

const LoadingText = styled.div`
  color: var(--white-smoke);
  font-size: 18px;
  font-family: font1;
`;
