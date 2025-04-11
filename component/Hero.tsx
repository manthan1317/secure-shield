import Link from "next/link";
import styled from "styled-components";

export default function Hero() {
  return (
    <HeroContainer>
      <div>
        <h3>Stay Secure, Stay Ahead</h3>
        <h3>Analyze Your Security Now</h3>
      </div>
      <div>
        <p>
          Protect your business with cutting-edge IP Analysis, Email Threat
          Detection, and Cybersecurity Management. Detect, analyze, and
          neutralize threats before they strike.
        </p>
        <div className="hero-btns">
          <Link href="#" className="border-bg-btn">
            Get Started
          </Link>
          <Link href="#" className="border-font-btn">
            Documentation
          </Link>
        </div>
      </div>
    </HeroContainer>
  );
}

const HeroContainer = styled.div`
  position: absolute;
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 4rem;
  width: 100%;
  z-index: 1000;
  color: var(--white-smoke);
  margin-top: 10rem;
  padding: 0px 150px;

  h3 {
    font-size: 33px;
    font-family: font2-500;
  }
  p {
    font-size: 25px;
    font-family: font1;
    width: 85%;
  }
  .hero-btns {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-top: 3rem;

    a:nth-child(1) {
      margin-right: 2rem;
    }
  }
`;
