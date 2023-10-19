import React from "react";
import { Route, Routes } from "react-router-dom";
import { Home } from "./pages/home";
import styled from "styled-components";
import { SongPageWithParams } from "./pages/song";
import { createSongForIdFn } from "./pages/song/songService";
import { configuration } from "./configuration";

const AppContainer = styled.div`
  text-align: center;
  display: grid;
  flex-direction: column;
  flex-wrap: nowrap;
  border: 1px solid green;
  height: 100%;
`;

const AppHeader = styled.header`
  text-align: center;
`;

const Screen = styled.div`
  //height: 90%;
  border: 1px solid purple;
  inset: 0 0 0 0;
  position: absolute;
  display: flex;
  flex-direction: column;
`;

const Branding = styled.h1`
  font-size: 5dvh;
`;

const getSongForId = createSongForIdFn({
  songsAPIHostURL: configuration.songsAPIHostURL,
});

function App() {
  return (
    <Screen className={"screen"}>
      <AppHeader className="App-header">
        <Branding>
          <div>John and Julie's Wedding!</div>
        </Branding>
      </AppHeader>
      <AppContainer className={"AppContainer"}>
        <Routes>
          <Route index element={<Home />} />
          <Route
            path={"/songs/:songId"}
            element={<SongPageWithParams getSong={getSongForId} />}
          />
        </Routes>
      </AppContainer>
    </Screen>
  );
}

export default App;
