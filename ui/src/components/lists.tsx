import { PropsWithChildren, ComponentProps } from "react";
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
  opacity: 1.0;
`;

const ListItemContainer = styled.div`
  background: linear-gradient(to right, #B640FF, #90E7B3);
  border-radius: 15px;
  margin: 1vh;
  padding: 0.3vh;
`;

export const ListItem = (
  props: PropsWithChildren & ComponentProps<"div"> ,
) => {
  return (
    <div { ...props }>
      <ListItemContainer>
        <ListItemContent>
          { props.children }
        </ListItemContent>
      </ListItemContainer>
    </div>
  );
};