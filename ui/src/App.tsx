import React from "react";
import { Route, Routes } from "react-router-dom";
import { Home } from "./pages/home";
import styled from "styled-components";
import { GetSong, Song, SongPage } from "./pages/song";

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

const fakeFetch: GetSong = (): Promise<Song> => {
  return Promise.resolve({
    id: "song1",
    title:
      "The long way to get to the place that I am going and then I get there",
    artist: "The Greatful Racoons of Yore",
  });
};

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
            element={<SongPage getSong={fakeFetch} />}
          />
        </Routes>
      </AppContainer>
    </div>
  );
}

export default App;
