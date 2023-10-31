import React from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { Home } from "./pages/home";
import styled from "styled-components";
import { SongPageWithParams } from "./pages/song";
import { configuration } from "./configuration";
import * as TagService from "./pages/songs/tagsService";
import * as SongService from "./services/songService";
import * as PlaylistService from "./services/playListService";
import * as VotingService from "./services/votingService";
import * as UserService from "./services/userService";
import { GenreSelectorPage } from "./pages/songs/genreSelectorPage";
import { SongListPage } from "./pages/songs/songlistPage";
import { GetPlaylist, PlayListPage } from "./pages/playlist/playlist";
import { RegisterUser } from "./services/userService";

const AppContainer = styled.div`
  text-align: center;
  flex-direction: column;
  flex-wrap: nowrap;
  border: 1px solid green;
  height: 100%;
  overflow-y: hidden;
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
  font-size: 5vh;
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

const getPlayListFn: GetPlaylist = PlaylistService.createGetPlaylist({
  songsAPIHostURL: configuration.songsAPIHostURL,
});

const voteForSongFn = VotingService.createVoteForSong({
  songsAPIHostURL: configuration.songsAPIHostURL,
});

const registerUserFn: RegisterUser = UserService.createRegisterUser({
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
          <Route index element={<Home registerUser={registerUserFn} />} />
          <Route
            path={"/songs/:songId"}
            element={
              <SongPageWithParams
                getSong={getSongForIdFn}
                voteForSong={voteForSongFn}
              />
            }
          />
          <Route
            path={"/genres"}
            element={
              <GenreSelectorPage getGenres={getGenresFn} nav={navigator} />
            }
          />
          <Route
            path={"/tags/:tag/songs"}
            element={
              <SongListPage
                getSongsForTagId={getSongsForTagIdFn}
                nav={navigator}
              />
            }
          />
          <Route
            path={"/playlist"}
            element={
              <PlayListPage getPlaylist={getPlayListFn} nav={navigator} />
            }
          />
        </Routes>
      </AppContainer>
    </Screen>
  );
}

export default App;
