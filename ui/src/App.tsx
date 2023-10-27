import React from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { Home } from "./pages/home";
import styled from "styled-components";
import { SongPageWithParams } from "./pages/song";
import { configuration } from "./configuration";
import * as TagService from "./pages/songs/tagsService";
import * as SongService from "./services/songService";
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

const getSongForIdFn = SongService.createSongForIdFn({
  songsAPIHostURL: configuration.songsAPIHostURL,
});

const getGenresFn = TagService.createGetTagsByName("genre", {
  songsAPIHostURL: configuration.songsAPIHostURL,
});

const getSongsForTagIdFn = SongService.createGetSongsByTagId({
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
            element={<SongPageWithParams getSong={getSongForIdFn} />}
          />
          <Route
            path={"/genres"}
            element={
              <GenreSelectorPage getGenres={getGenresFn} nav={navigator} />
            }
          />
          <Route
            path={"/tags/:tag/songs"}
            element={<SongListPage getSongsForTagId={getSongsForTagIdFn} />}
          />
        </Routes>
      </AppContainer>
    </Screen>
  );
}

export default App;
