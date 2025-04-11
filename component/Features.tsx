import styled from "styled-components";

export default function Features() {
  return (
    <FeaturesMain>
      <h3>Secure shield keeps you leaps ahead.</h3>
      <h3>Best Security suite, that you need.</h3>
      <div className="feature-card">
        <div className="label"></div>
        <h4>
          Secure shield<span>Features</span>
        </h4>
        <div className="feature-grid">
          <div className="feature-data">
            <h5>Scalable Protection for Any Business</h5>
            <p>
              From startups to enterprises, our flexible cybersecurity solutions
              adapt to your needs, ensuring robust protection at any scale.
            </p>
          </div>
          <div className="feature-data">
            <h5>Privacy & Data Security</h5>
            <p>
              We prioritize your privacy—your data is never stored or shared.
              Our platform is designed to ensure maximum security and compliance
              with industry standards.
            </p>
          </div>
          <div className="feature-data">
            <h5>Email Threat Intelligence</h5>
            <p>
              Stop phishing and email-based attacks before they reach your
              inbox. Our system scans, analyzes, and flags suspicious emails
              with cutting-edge threat detection.
            </p>
          </div>
          <div className="feature-data">
            <h5>Comprehensive IP Analysis</h5>
            <p>
              Analyze IP addresses in real-time to detect malicious activity,
              prevent fraud, and identify potential security risks with our
              advanced IP tracking tools.
            </p>
          </div>
          <div className="feature-data">
            <h5>Advanced Threat Protection</h5>
            <p>
              Detect and neutralize cyber threats before they impact your
              business. Our AI-driven system continuously monitors for
              suspicious activity across your network.
            </p>
          </div>
          <div className="feature-data">
            <h5>Privacy & Data Security</h5>
            <p>
              We prioritize your privacy—your data is never stored or shared.
              Our platform is designed to ensure maximum security and compliance
              with industry standards.
            </p>
          </div>
        </div>
      </div>
    </FeaturesMain>
  );
}

const FeaturesMain = styled.div`
  position: absolute;
  top: 137%;
  width: 100%;
  z-index: 1000;
  padding: 0px 150px;
  /* padding-bottom: 35rem; */

  h3 {
    font-size: 40px;
    font-family: font2-300;
    color: var(--white-smoke);
  }
  .feature-card {
    position: relative;
    margin-top: 3.5rem;
    padding: 64px 48px;
    border: 1px solid var(--white-smoke);
    border-radius: 7px;
    backdrop-filter: blur(1px) saturate(102%);
    -webkit-backdrop-filter: blur(1px) saturate(102%);
    background-color: rgba(0, 176, 60, 0.1);

    .label {
      position: absolute;
      top: 0%;
      left: 0%;
      height: 10px;
      width: 100%;
      background-color: rgb(31, 184, 205);
      border-top-left-radius: 7px;
      border-top-right-radius: 7px;
    }
    h4 {
      font-size: 25px;
      font-weight: 500;
      text-transform: uppercase;
      font-family: font2-600;
      color: var(--white-smoke);

      span {
        text-transform: lowercase;
        margin-left: 20px;
        font-family: font2-300;
      }
    }
    .feature-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-column-gap: 5rem;
      grid-row-gap: 2rem;
      margin-top: 1.5rem;

      .feature-data {
        h5 {
          font-size: 18px;
          color: var(--white-smoke);
          font-family: font2-400;
          margin-bottom: 0.4rem;
        }
        p {
          color: gray;
        }
      }
    }
  }
`;
