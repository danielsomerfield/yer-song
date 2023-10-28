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

const NavButton = styled.button`
  width: 90%;
  height: 12dvh;
  margin: 2dvh;
  font-size: 4dvh;
`;

export const NavPanel = (props: PropsWithChildren) => {
  const navigate = useNavigate();

  // TODO (MVP): make this a register if not registered
  return (
    <>
      <MainPanel className={"SongControlPanel.MainPanel"}>
        <NavButton
          title={"Back to songs"}
          onClick={() => {
            navigate("/genres");
          }}
        >
          Browse
        </NavButton>
        <NavButton
          title={"Playlist"}
          onClick={() => {
            navigate("/playlist");
          }}
        >
          Playlist
        </NavButton>
        {props.children}
      </MainPanel>
    </>
  );
};
