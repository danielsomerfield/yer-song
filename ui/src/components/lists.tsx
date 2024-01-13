import { ComponentProps, PropsWithChildren } from "react";
import styled from "styled-components";

const ListItemContent = styled.div`
  &:hover {
    opacity: 0.8;
  }

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
  padding: 2% 2% 2% 2%;

  background-color: white;
  margin: 2px;
  border-radius: 10px;
  opacity: 1;
`;

const ListItemContainer = styled.div`
  &:hover {
    transform: scale(1.07);
  }
  background: linear-gradient(to right, #b640ff, #90e7b3);
  border-radius: 15px;
  margin: 1vh;
  padding: 0.3vh;
  transition: all 0.2s ease-in-out;
`;

export const ListItem = (props: PropsWithChildren & ComponentProps<"div">) => {
  return (
    <div {...props}>
      <ListItemContainer>
        <ListItemContent>{props.children}</ListItemContent>
      </ListItemContainer>
    </div>
  );
};
