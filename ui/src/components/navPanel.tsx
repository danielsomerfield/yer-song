import styled from "styled-components";
import { NavigateFunction, useNavigate } from "react-router-dom";
import { PropsWithChildren } from "react";

const MainPanel = styled.div`
  display: flex;
  flex-flow: row;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-image: linear-gradient(to bottom right, #6500a3, #2e518a);
  border-top: 1vh solid #44006f;
  padding: 0 1vh 1vh 1vh;
`;

export const NavButton = styled.button`
  width: 90%;
  min-height: 12vh;
  margin: 1vh;
  font-size: 3.5vh;
  min-width: 8vh;
  border-color: #d1F1E4;
  color: white;
`;

export const NavPanel = (
  props: PropsWithChildren & { nav: NavigateFunction },
) => {
  const { nav } = props;
  return (
    <>
      <MainPanel className={"SongControlPanel.MainPanel"}>
        <NavButton
          className="browse-button"
          title={"Back to songs"}
          onClick={() => {
            nav("/genres");
          }}
        >
          Browse
        </NavButton>
        <NavButton
          className="playlist-button"
          title={"Playlist"}
          onClick={() => {
            nav("/playlist");
          }}
        >
          Playlist
        </NavButton>
        {props.children}
      </MainPanel>
    </>
  );
};

export const BackButton = () => {
  const lastLocation = localStorage.getItem("lastLocation");
  localStorage.removeItem("lastLocation");
  return (
    <NavButton
      className="back-button"
      disabled={lastLocation == null}
      onClick={() => {
        // TODO: fix this hack
        if (lastLocation) {
          window.location.href = lastLocation;
        }
      }}
    >
      <svg viewBox="0 0 600 600" height={"90%"}>
        <g>
          <path
            color={"rgb(150, 150, 150)"}
            fill={"currentcolor"}
            d="M90.978,212.283l121.304,121.303v-60.654c0,0,121.3-30.324,181.953,60.654c0-100.483-81.473-181.956-181.953-181.956
		V90.979L90.978,212.283z M0,242.607c0,133.976,108.628,242.606,242.606,242.606c134.006,0,242.608-108.631,242.608-242.606
		c0-133.978-108.603-242.606-242.608-242.606C108.628,0.001,0,108.63,0,242.607z M30.326,242.607
		c0-117.038,95.241-212.279,212.28-212.279c117.068,0,212.277,95.241,212.277,212.279c0,117.039-95.209,212.28-212.277,212.28
		C125.567,454.888,30.326,359.646,30.326,242.607z"
          />
        </g>
      </svg>
    </NavButton>
  );
};

export const setBackButtonLocation = (location: string) => {
  localStorage.setItem("lastLocation", location);
};
