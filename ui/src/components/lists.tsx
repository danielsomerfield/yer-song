import styled from "styled-components";

export const ListItem = styled.div`
  height: 6dvh;

  &:hover {
    background-color: lightblue;
  }

  font-size: 4dvh;
  white-space: nowrap;
  overflow: clip;
  text-overflow: ellipsis;
  text-align: left;
  padding: 1dvh 0 1dvh 0;
`;
