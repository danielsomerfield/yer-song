import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { PropsWithChildren } from "react";

const MainPanel = styled.div`
  display: flex;
  flex-flow: row;
  position: absolute;
  border: 1px solid blue;
  bottom: 0;
  left: 0;
  right: 0;
`;

const BackToSongsButton = styled.button`
  width: 90%;
  height: 12dvh;
  margin: 2dvh;
  font-size: 4dvh;
`;

export const SongControlPanel = (props: PropsWithChildren) => {
  const navigate = useNavigate();

  // TODO (MVP): make this a register if not registered
  const navigateToSelector = () => {
    navigate("/genres");
  };

  return (
    <>
      <MainPanel className={"SongControlPanel.MainPanel"}>
        <BackToSongsButton title={"Back to songs"} onClick={navigateToSelector}>
          Browse
        </BackToSongsButton>
        {props.children}
      </MainPanel>
    </>
  );
};
