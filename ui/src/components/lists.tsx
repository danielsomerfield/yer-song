import styled from "styled-components";

export const ListItem = styled.div`
  height: 6vh;

  &:hover {
    background-color: lightblue;
  }

  white-space: nowrap;
  overflow: clip;
  text-overflow: ellipsis;
  text-align: left;
  padding: 1vh 0 1vh 0;
  display: flex;
  flex-direction: row;
`;
