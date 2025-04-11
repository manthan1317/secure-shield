import styled from "styled-components";

export default function Newsletter() {
  return (
    <NewsletterMain>
      <h5>
        Join our developer community to stay on top of new releases, features,
        and updates.
      </h5>
      <div className="newsletter-container">
        <input type="text" placeholder="Email" suppressHydrationWarning />
        <div className="join">Join</div>
      </div>
    </NewsletterMain>
  );
}

const NewsletterMain = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0px 64px;
  height: 320px;
  background-color: rgb(119, 119, 77);

  h5 {
    color: #fff;
    font-family: font2-400;
    font-size: 30px;
    width: 50%;
  }
  .newsletter-container {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 8rem;
    input {
      outline: none;
      border: none;
      width: 350px;
      padding: 18px 23px;
      background-color: #fff;
      border-radius: 7px;
      font-family: font1;

      &::placeholder {
        color: #9e9d9d;
        font-family: font1;
      }
    }

    .join {
      font-family: font1;
      background-color: #000;
      padding: 18px 35px;
      color: var(--white-smoke);
      border-radius: 7px;
      margin-left: 1.8rem;
    }
  }
`;
