import React from "react";
import { NavigateFunction, Route, Routes, useNavigate } from "react-router-dom";
import { Home } from "./pages/home";
import styled from "styled-components";
import { SongPageWithParams } from "./pages/song";
import { createSongForIdFn } from "./pages/song/songService";
import { configuration } from "./configuration";
import { createGetTagsByName } from "./pages/songs/tagsService";
import { To } from "@remix-run/router";
import { NavigateOptions } from "react-router/dist/lib/context";
import { GenreSelectorPage } from "./pages/songs/genreSelectorPage";
import { SongListPage } from "./pages/songs/songlistPage";

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

const getGenresFn = createGetTagsByName("genre", {
  songsAPIHostURL: configuration.songsAPIHostURL,
});

function App() {
  const navigator = useNavigate();

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
          <Route
            path={"/genres"}
            element={
              <GenreSelectorPage getGenres={getGenresFn} nav={navigator} />
            }
          />
          <Route
            path={"/tags/:tag/songs"}
            element={<SongListPage getSongsForTag={() => []} />}
          />
        </Routes>
      </AppContainer>
    </Screen>
  );
}

export default App;
