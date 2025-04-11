import Link from "next/link";
import Image from "next/image";
import styled from "styled-components";
import logo from "../assets/header-logo.png";

export default function Header() {
  return (
    <HeaderContainer>
      <h4>Secure Shield</h4>
      <Image src={logo} alt="logo" />
      <Link href="/login" className="border-btn">
        Get Started
      </Link>
    </HeaderContainer>
  );
}

const HeaderContainer = styled.div`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1000;
  height: 84px;
  width: 100%;
  padding: 0px 25px;

  h4 {
    font-size: 20px;
    font-weight: 500;
    color: #fff;
    font-family: font2-500;
  }
  img {
    width: 50px;
    height: 50px;
  }
`;

const GetStarted = styled(Link)`
  border: 1px solid var(--white-smoke);
  border-radius: 5px;
  padding: 7px 20px;
  color: var(--white-smoke);
  font-size: 13px;
  font-family: font1;
`;
