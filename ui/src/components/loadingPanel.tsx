import styled from "styled-components";

const LoadingMessageStyle = styled.div`
  font-size: 5vh;
  margin-top: 10vh;
`;

export const LoadingMessagePanel = () => {
  return (
    <LoadingMessageStyle role={"note"} aria-label={"loading"}>
      Loading...
    </LoadingMessageStyle>
  );
};
