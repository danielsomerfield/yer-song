import styled from "styled-components";

const MainPanel = styled.div`
  display: flex;
  flex-flow: row;
  position: absolute;
  border: 1px solid blue;
  bottom: 0;
  left: 0;
  right: 0;
`;

const VoteButton = styled.button`
  width: 90%;
  height: 12dvh;
  margin: 2dvh;
  font-size: 4dvh;
`;

const BackToSongsButton = styled.button`
  width: 90%;
  height: 12dvh;
  margin: 2dvh;
  font-size: 4dvh;
`;

export const SongControlPanel = () => {
  return (
    <>
      <MainPanel className={"SongControlPanel.MainPanel"}>
        <VoteButton title={"Up Vote!"}>Up Vote!</VoteButton>
        <BackToSongsButton title={"Back to songs"}>
          Back to songs
        </BackToSongsButton>
      </MainPanel>
    </>
  );
};
