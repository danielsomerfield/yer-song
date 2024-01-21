import React, { useEffect, useRef, useState } from "react";
import { NavigateFunction } from "react-router-dom";
import { LoadingMessagePanel } from "../../components/loadingPanel";
import { NavPanel, setBackButtonLocation } from "../../components/navPanel";
import { GetPlaylist, Playlist } from "../../domain/playlist";
import { currentUser, RegisterUser } from "../../services/userService";
import * as Toast from "@radix-ui/react-toast";
import { RegistrationForm } from "../../components/registrationForm";
import { LoadStatus, LoadStatuses } from "../common/loading";
import { StatusCodes } from "../../services/common";
import { PlaylistView } from "./playlistView";

type VoteForSong = (id: string) => Promise<void>;

export const PlayListPage = ({
  getPlaylist,
  voteForSong,
  nav,
  registerUser,
  refreshTime = 5000,
}: {
  getPlaylist: GetPlaylist;
  voteForSong: VoteForSong;
  nav: NavigateFunction;
  registerUser: RegisterUser;
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

    if (loadStatus.name == LoadStatuses.UNINITIALIZED.name) {
      (async () => {
        setLoadStatus(LoadStatuses.LOADING);
        await refreshPlaylist();
      })();
    } else if (loadStatus.name == "loaded" && timer.current == undefined) {
      timer.current = window.setInterval(async () => {
        await refreshPlaylist();
      }, refreshTime);
    }
  }, undefined);

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
      {panel()}

      {/*TODO: Refactor this toast code*/}
      <Toast.Root
        className={"Toast"}
        open={toastOpen}
        onOpenChange={setToastOpen}
      >
        <Toast.Description>Your vote has been added</Toast.Description>
      </Toast.Root>
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
