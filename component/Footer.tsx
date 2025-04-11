import Image from "next/image";
import Link from "next/link";
import styled from "styled-components";
import footerLogo from "../assets/footer-icon.png";

export default function Footer() {
  return (
    <FooterMain>
      <FooterGrid>
        <div className="card">
          <div className="title">company</div>
          <ul>
            <li>
              <Link href="#">Careers</Link>
            </li>
            <li>
              <Link href="#">Privacy Policy</Link>
            </li>
            <li>
              <Link href="#">Guidelines</Link>
            </li>
            <li>
              <Link href="#">Terms & Conditions</Link>
            </li>
          </ul>
        </div>
        <div className="card">
          <div className="title">product</div>
          <ul>
            <li>
              <Link href="#">Desktop App</Link>
            </li>
            <li>
              <Link href="#">iPhone App</Link>
            </li>
            <li>
              <Link href="#">Android App</Link>
            </li>
          </ul>
        </div>
        <div className="card">
          <div className="title">RESOURCES</div>
          <ul>
            <li>
              <Link href="#">Getting Started</Link>
            </li>
            <li>
              <Link href="#">General FAQS</Link>
            </li>
            <li>
              <Link href="#">Give feedback</Link>
            </li>
          </ul>
        </div>
        <div className="card">
          <div className="title">LABS</div>
          <ul>
            <li>
              <Link href="#">Documentation</Link>
            </li>
            <li>
              <Link href="#">FAQS</Link>
            </li>
            <li>
              <Link href="#">Terms of Service</Link>
            </li>
          </ul>
        </div>
        <div className="card">
          <div className="title">Follow us</div>
          <ul>
            <li>
              <Link href="#">X ( Twitter )</Link>
            </li>
            <li>
              <Link href="#">Linkedin</Link>
            </li>
            <li>
              <Link href="#">Instagram</Link>
            </li>
            <li>
              <Link href="#">YouTube</Link>
            </li>
          </ul>
        </div>
      </FooterGrid>
      <FooterCopy>
        <div>
          <Image src={footerLogo} alt="" />
        </div>
        <div>
          <p>&copy; Copyright 2025 SecureShield</p>
        </div>
      </FooterCopy>
    </FooterMain>
  );
}

const FooterMain = styled.div`
  height: 300px;
  width: 100%;
  background-color: #fff;
  color: #333;
  z-index: 10000;
  padding: 48px;
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  padding-bottom: 30px;

  .card {
    .title {
      text-transform: uppercase;
      font-size: 18px;
      font-family: font1;
      margin-bottom: 0.3rem;
    }
    ul {
      li {
        margin-bottom: 0.3rem;
        a {
          font-size: 12px;
          font-family: font2-600;
          color: #333;
        }
      }
    }
  }
`;

const FooterCopy = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 25px;
  border-top: 1px solid gray;

  img {
    width: 40px;
    height: 40px;
  }
  p {
    font-family: font1;
    font-size: 15px;
  }
`;
