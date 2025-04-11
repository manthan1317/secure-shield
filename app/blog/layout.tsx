"use client";

import { ReactNode } from "react";
import Link from "next/link";
import styled from "styled-components";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <BlogLayoutContainer>
        <Header>
          <div className="header-content">
            <Link href="/" className="logo">
              <h1>Secure Shield</h1>
            </Link>
            <nav>
              <Link href="/">Home</Link>
              <Link href="/register">Get Started</Link>
            </nav>
          </div>
        </Header>

        <main>{children}</main>

        <Footer>
          <div className="footer-content">
            <div className="footer-info">
              <h3>Secure Shield</h3>
              <p>Stay Secure, Stay Ahead</p>
            </div>
            <div className="footer-links">
              <div className="link-column">
                <h4>Follow us</h4>
                <Link href="#">X ( Twitter )</Link>
                <Link href="#">Linkedin</Link>
                <Link href="#">Instagram</Link>
                <Link href="#">YouTube</Link>
              </div>
              <div className="link-column">
                <h4>Other</h4>
                <Link href="/privacy">Documentation</Link>
                <Link href="/privacy">FAQS</Link>
                <Link href="/privacy">Privacy Policy</Link>
                <Link href="/terms">Terms of Service</Link>
              </div>
            </div>
          </div>
          <div className="copyright">
            &copy; {new Date().getFullYear()} Secure Shield. All rights
            reserved.
          </div>
        </Footer>
      </BlogLayoutContainer>
    </ThemeProvider>
  );
}

const BlogLayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: rgb(9, 23, 23);

  main {
    flex: 1;
  }
`;

const Header = styled.header`
  background-color: rgb(9, 23, 23);
  color: var(--white-smoke);
  padding: 20px 0;
  position: sticky;
  top: 0;
  z-index: 1000;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo {
    text-decoration: none;

    h1 {
      font-size: 20px;
      font-weight: 500;
      color: #fff;
      font-family: font2-500;
    }
  }

  nav {
    display: flex;
    gap: 30px;
    align-items: center;

    a {
      font-family: font1;
      font-size: 16px;
      color: var(--white-smoke);
      text-decoration: none;
      transition: opacity 0.3s ease;

      &:hover {
        opacity: 0.8;
      }
    }

    .admin-link {
      padding: 5px 12px;
      border: 1px solid var(--white-smoke);
      border-radius: 4px;

      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }
    }
  }

  @media (max-width: 768px) {
    .header-content {
      flex-direction: column;
      gap: 15px;
    }

    nav {
      gap: 15px;
      flex-wrap: wrap;
      justify-content: center;
    }
  }
`;

const Footer = styled.footer`
  background-color: rgb(7, 18, 18);
  color: var(--white-smoke);
  padding: 60px 20px 20px;

  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    margin-bottom: 40px;
  }

  .footer-info {
    h3 {
      font-family: font2-300;
      font-size: 24px;
      margin: 0 0 10px;
    }

    p {
      font-family: font1;
      opacity: 0.7;
      margin: 0;
    }
  }

  .footer-links {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
  }

  .link-column {
    display: flex;
    flex-direction: column;

    h4 {
      font-family: font1;
      font-size: 18px;
      margin: 0 0 15px;
    }

    a {
      font-family: font1;
      font-size: 14px;
      color: var(--white-smoke);
      opacity: 0.7;
      text-decoration: none;
      margin-bottom: 10px;
      transition: opacity 0.3s ease;

      &:hover {
        opacity: 1;
      }
    }
  }

  .copyright {
    text-align: center;
    font-family: font1;
    font-size: 14px;
    opacity: 0.5;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  @media (max-width: 768px) {
    .footer-content {
      grid-template-columns: 1fr;
      gap: 30px;
    }
  }
`;
