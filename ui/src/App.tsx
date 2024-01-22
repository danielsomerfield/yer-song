import React from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { SongPageWithParams } from "./pages/song";
import { configuration } from "./configuration";
import * as TagService from "./pages/songs/tagsService";
import * as SongService from "./services/songService";
import * as PlaylistService from "./services/playListService";
import * as VotingService from "./services/votingService";
import * as UserService from "./services/userService";
import { currentUser, RegisterUser } from "./services/userService";
import { GenreSelectorPage } from "./pages/songs/genreSelectorPage";
import { SongListPage } from "./pages/songs/songlistPage";
import { PlayListPage } from "./pages/playlist/playlist";
import AdminPage from "./pages/admin";
import { GetPlaylist } from "./domain/playlist";
import { KioskPlaylist } from "./pages/kiosk";
import * as Toast from "@radix-ui/react-toast";
import { AdminService, createAdminService } from "./pages/admin/adminService";
import { ErrorBoundary } from "react-error-boundary";
import { Logout } from "./pages/admin/logout";
import { VoteModes } from "./domain/voting";

const AppContainer = styled.div`
  text-align: center;
  flex-direction: column;
  flex-wrap: nowrap;
  height: 100%;
  overflow-y: hidden;
`;

const AppHeader = styled.header`
  text-align: center;
  background-image: linear-gradient(to bottom right, #6500a3, #2e518a);
  border-bottom: 1vh solid #44006f;
  display: grid;
  grid-template-columns: 5fr auto;
`;

const Screen = styled.div`
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

const submitDollarVoteForSongFn = VotingService.createDollarVoteForSong({
  songsAPIHostURL: configuration.songsAPIHostURL,
});
const registerUserFn: RegisterUser = UserService.createRegisterUser({
  songsAPIHostURL: configuration.songsAPIHostURL,
});

const adminService: AdminService = createAdminService({
  songsAPIHostURL: configuration.songsAPIHostURL,
});

// noinspection CssUnknownTarget
const QRCodePanelDiv = styled.div`
  display: none;
  margin: 1vh 5vh 1vh 1vh;
  width: 10vh;
  height: 10vh;
  background-size: contain;
  background-image: url("./qrcode_yersong.danielsomerfield.com.png");
`;

const ErrorFallbackPanel = styled.div`
  font-size: 5vh;
  margin: 3vh 1vh 1vh;
`;

const ErrorFallbackMessage = styled.div`
  margin-top: 10vh;
  font-size: 3vh;
  font-style: italic;
`;

function App() {
  const navigator = useNavigate();

  const ErrorFallback = () => {
    return (
      <ErrorFallbackPanel>
        <div>It's not a bug. It's a feature&trade;.</div>
        <ErrorFallbackMessage>
          Feel free to report this "feature". Or don't. But please do refresh
          the screen and cross your fingers.
        </ErrorFallbackMessage>
      </ErrorFallbackPanel>
    );
  };

  return (
    <Screen className={"screen"}>
      <AppHeader className="App-header">
        <Branding>
          <div>John and Julie's Wedding!</div>
        </Branding>
        <div>
          <QRCodePanelDiv id={"qr-code"} />
        </div>
      </AppHeader>

      <Toast.Provider>
        <AppContainer className={"AppContainer"}>
          <ErrorBoundary fallbackRender={ErrorFallback}>
            <Routes>
              <Route
                path={"/songs/:songId"}
                element={
                  <SongPageWithParams
                    getSong={getSongForIdFn}
                    voteForSong={voteForSongFn}
                    currentUser={currentUser}
                    nav={navigator}
                    voteMode={VoteModes.SINGLE_VOTE}
                    submitDollarVoteForSong={submitDollarVoteForSongFn}
                  />
                }
              />
              <Route
                path={"/genres"}
                element={
                  <GenreSelectorPage
                    getGenres={getGenresFn}
                    nav={navigator}
                    registerUser={registerUserFn}
                  />
                }
              />
              <Route
                path={"/tags/:tag/songs"}
                element={
                  <SongListPage
                    registerUser={registerUserFn}
                    getSongsForTagId={getSongsForTagIdFn}
                    nav={navigator}
                  />
                }
              />
              <Route
                path={"/playlist"}
                element={
                  <PlayListPage
                    getPlaylist={getPlayListFn}
                    nav={navigator}
                    voteForSong={voteForSongFn}
                    registerUser={registerUserFn}
                  />
                }
              />
              <Route
                path={"/kiosk"}
                element={<KioskPlaylist getPlaylist={getPlayListFn} />}
              />

              <Route
                path={"/admin"}
                element={
                  <AdminPage
                    getPlaylist={getPlayListFn}
                    adminService={adminService}
                    getCurrentUser={currentUser}
                  />
                }
              />

              <Route path={"/logout"} element={<Logout />} />
              {/*  Be default, navigate to the playlist */}
              <Route path="*" element={<Navigate to="/playlist" />} />
            </Routes>
          </ErrorBoundary>
          <Toast.Viewport />
        </AppContainer>
      </Toast.Provider>
    </Screen>
  );
}

export default App;
