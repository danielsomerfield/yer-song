import React from "react";
import { Route, Routes } from "react-router-dom";
import { Home } from "./pages/home";
import styled from "styled-components";
import { SongPageWithParams } from "./pages/song";
import { createSongForIdFn } from "./pages/song/songService";
import { configuration } from "./configuration";

const AppContainer = styled.main`
  text-align: center;
  display: flex;
  flex-flow: column;
  top: 50%;
  position: relative;
  height: 100%;
  border: 2px solid #000000;
`;

const AppHeader = styled.header`
  text-align: center;
`;

const Branding = styled.h1`
  font-size: 3em;
`;

const getSongForId = createSongForIdFn({
  songsAPIHostURL: configuration.songsAPIHostURL,
});

function App() {
  return (
    <div>
      <AppHeader className="App-header">
        <Branding>Branding here</Branding>
      </AppHeader>
      <AppContainer>
        <Routes>
          <Route index element={<Home />} />
          <Route
            path={"/songs/:songId"}
            element={<SongPageWithParams getSong={getSongForId} />}
          />
        </Routes>
      </AppContainer>
    </div>
  );
}

export default App;
