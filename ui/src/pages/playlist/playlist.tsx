import React, { useEffect, useRef, useState } from "react";
import { NavigateFunction } from "react-router-dom";
import { LoadingMessagePanel } from "../../components/loadingPanel";
import { NavPanel, setBackButtonLocation } from "../../components/navPanel";
import { GetPlaylist, Playlist } from "../../domain/playlist";
import { currentUser, RegisterUser } from "../../services/userService";
import { RegistrationForm } from "../../components/registrationForm";
import { LoadStatus, LoadStatuses } from "../common/loading";
import { StatusCodes } from "../../services/common";
import { PlaylistView } from "./playlistView";
import { VoteMode } from "../../domain/voting";
import { ToastPopup } from "../../components/toast";
import styled from "styled-components";

type VoteForSong = (id: string) => Promise<void>;

const NextTimePanel = styled.div`
  margin-top: 4vh;
  padding: 2vh;
  text-align: center;
  vertical-align: center;
`;

export const PlayListPage = ({
  getPlaylist,
  voteForSong,
  nav,
  registerUser,
  voteMode,
  refreshTime = 5000,
}: {
  getPlaylist: GetPlaylist;
  voteForSong: VoteForSong;
  nav: NavigateFunction;
  registerUser: RegisterUser;
  voteMode: VoteMode;
  refreshTime?: number;
}) => {
  const [toastOpen, setToastOpen] = useState(false);

  const [loadStatus, setLoadStatus] = useState<LoadStatus<Playlist>>(
    LoadStatuses.UNINITIALIZED,
  );

  const timer = useRef<number | undefined>(undefined);

  const refreshPlaylist = async () => {
    const maybePlaylist = await getPlaylist();

    if (maybePlaylist.status == StatusCodes.REGISTRATION_REQUIRED) {
      if (timer.current) {
        window.clearInterval(timer.current);
        timer.current = undefined;
      }
      setLoadStatus(LoadStatuses.REGISTRATION_REQUIRED);
    } else if (maybePlaylist.status == "OK") {
      setLoadStatus({
        data: maybePlaylist.value,
        name: "loaded",
      });
    }
  };

  useEffect(() => {
    setBackButtonLocation("/playlist");

    // Disabled
    // if (loadStatus.name == LoadStatuses.UNINITIALIZED.name) {
    //   (async () => {
    //     setLoadStatus(LoadStatuses.LOADING);
    //     await refreshPlaylist();
    //   })();
    // } else if (loadStatus.name == "loaded" && timer.current == undefined) {
    //   timer.current = window.setInterval(async () => {
    //     await refreshPlaylist();
    //   }, refreshTime);
    // }
  }, undefined);

  //TODO: replace this function with a shared component
  const panel = () => {
    if (loadStatus.name == LoadStatuses.LOADING.name) {
      return <LoadingMessagePanel />;
    } else if (loadStatus.name == LoadStatuses.REGISTRATION_REQUIRED.name) {
      return (
        <RegistrationForm
          registerUser={registerUser}
          onLogin={() => {
            setLoadStatus(LoadStatuses.UNINITIALIZED);
          }}
        />
      );
    } else if (loadStatus.name == "loaded") {
      if (loadStatus.data?.songs.page) {
        if (loadStatus.data.songs.page.length == 0) {
          return <EmptyPanel />;
        } else {
          return (
            <PlaylistView
              playlist={loadStatus.data}
              nav={nav}
              currentUser={currentUser}
              voteForSong={voteForSong}
              voteMode={voteMode}
              showToast={() => {
                setToastOpen(true);
              }}
            />
          );
        }
      } else {
        // TODO: can we eliminate this case with type manipulations?
        console.error("This isn't supposed to happen");
        return <EmptyPanel />;
      }
    }
  };
  return (
    <>
      <NextTimePanel>
        The concert is over and registration is now disabled. We hope to see you
        again!
      </NextTimePanel>
      {panel()}
      <ToastPopup
        toastOpen={toastOpen}
        setToastOpen={setToastOpen}
        text={"Your vote has been added"}
      />
      <NavPanel nav={nav} />
    </>
  );
};

const EmptyPanel = () => {
  return (
    <>
      <div role={"note"} aria-label={"empty-playlist"} className="message">
        The playlist is empty. Add a song!
      </div>
    </>
  );
};
