import styled from "styled-components";
import { BsSpeedometer2 } from "react-icons/bs";
import { AiOutlineDollar } from "react-icons/ai";
import { GoShieldLock } from "react-icons/go";

export default function Stats() {
  return (
    <StatsMain>
      <div className="stat-card">
        <BsSpeedometer2 className="stat-icon" />
        <div>
          <h5>Outerforms the rest</h5>
          <p>
            Unparalleled real time, web based features and advanced
            capabilities.
          </p>
        </div>
      </div>
      <div className="stat-card">
        <AiOutlineDollar className="stat-icon" />
        <div>
          <h5>Most affordable</h5>
          <p>
            Secure shield grounding request pricing has the competition beat.
          </p>
        </div>
      </div>
      <div className="stat-card">
        <GoShieldLock className="stat-icon" />
        <div>
          <h5>Private and secure</h5>
          <p>No log saved of your data.</p>
        </div>
      </div>
    </StatsMain>
  );
}

const StatsMain = styled.div`
  position: absolute;
  top: 110%;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 7rem;
  width: 100%;
  z-index: 1000;
  padding: 0px 150px;

  .stat-card {
    display: flex;
    align-items: flex-start;
    justify-content: center;

    h5 {
      font-size: 17px;
      color: var(--white-smoke);
      font-family: font1;
      margin-bottom: 0.5rem;
    }
    p {
      color: gray;
      font-size: 15px;
      font-family: font2-500;
      line-height: 1.6;
    }
    &:nth-child(2) .stat-icon,
    &:nth-child(1) .stat-icon {
      margin-right: 1.5rem;
      font-size: 60px;
      color: var(--white-smoke);
      margin-top: -0.8rem;
    }
    &:nth-child(3) .stat-icon {
      margin-right: 1.5rem;
      font-size: 35px;
      color: var(--white-smoke);
    }
  }
`;
