import Image from "next/image";
import styled from "styled-components";
import footerCta from "../assets/footer-cta-bg.jpg";
import Link from "next/link";

export default function FooterCta() {
  return (
    <CtaMain>
      <Image src={footerCta} alt="" />
      <div className="data">
        <h3>Stay secure with Secure Shield .</h3>
        <Link href="#" className="border-bg-btn">
          Get Started
        </Link>
      </div>
    </CtaMain>
  );
}

const CtaMain = styled.div`
  position: relative;
  background-color: rgb(9, 23, 23);
  width: 100%;
  z-index: 1000;

  img {
    height: 700px;
    object-fit: cover;
  }
  .data {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    width: 100%;

    h3 {
      font-family: font1;
      font-size: 50px;
      text-transform: capitalize;
      color: #fff;
      margin-bottom: 2rem;
    }
  }
`;
