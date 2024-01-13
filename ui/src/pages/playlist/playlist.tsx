import React, { MouseEventHandler, useEffect, useState } from "react";
import styled from "styled-components";
import { NavigateFunction } from "react-router-dom";
import { ListItem } from "../../components/lists";
import { LoadingMessagePanel } from "../../components/loadingPanel";
import { NavPanel, setBackButtonLocation } from "../../components/navPanel";
import { SongWithVotes } from "../../domain/song";
import { GetPlaylist, Playlist } from "../../domain/playlist";
import { currentUser, CurrentUser } from "../../services/userService";
import * as Toast from "@radix-ui/react-toast";

type VoteForSong = (id: string) => Promise<void>;

const SongsPanel = styled.div`
  display: flex;
  flex-direction: column;
  overflow-y: scroll;
  height: 83%;
`;

const UpVoteButton = styled.button`
  margin: 0 1vh 0 0;
  font-size: 0.8em;
  padding: 0.5vh;
`;

const SongRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  grid-column-gap: 3vh;
  width: 100%;
  align-items: center;
`;

const SongTitle = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PlaylistView = ({
  playlist,
  nav,
  currentUser,
  voteForSong,
  showToast,
}: {
  playlist: Playlist;
  nav: NavigateFunction;
  voteForSong: VoteForSong;
  currentUser: CurrentUser;
  showToast: () => void;
}) => {
  const SongView = (song: SongWithVotes, i: number) => {
    const goToSong: MouseEventHandler = () => {
      nav(`/songs/${song.id}`);
    };

    const disableButton =
      song.voters.filter((v) => v.id == currentUser()?.id).length > 0;

    return (
      <ListItem
        role={"listitem"}
        key={`song::${song.id}`}
        aria-label={`song: ${song.title}`}
        data-id={song.id}
      >
        <SongRow>
          <SongTitle onClick={goToSong}>{song.title}</SongTitle>
          <div>
            <UpVoteButton
              disabled={disableButton}
              onClick={async (evt) => {
                console.log("Voting for a song");
                const button = evt.currentTarget;
                button.disabled = true;
                await voteForSong(song.id);
                showToast();
                // TODO: do a refresh
              }}
            >
              Up vote
            </UpVoteButton>
          </div>
        </SongRow>
      </ListItem>
    );
  };

  return (
    <>
      <SongsPanel role={"list"} aria-label={"song-list"}>
        {playlist.songs.page.map((tag, i) => SongView(tag, i))}
      </SongsPanel>
    </>
  );
};

export const PlayListPage = ({
  getPlaylist,
  voteForSong,
  nav,
}: {
  getPlaylist: GetPlaylist;
  voteForSong: VoteForSong;
  nav: NavigateFunction;
}) => {
  const [playlist, setPlaylist] = useState<Playlist | undefined>(undefined);
  const [loadStarted, setLoadStarted] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  // TODO: refactor this loading pattern out. It's always the same
  useEffect(() => {
    setBackButtonLocation("/playlist");
    if (!playlist) {
      if (!loadStarted) {
        setLoadStarted(true);
        (async () => {
          const playlist = await getPlaylist();
          setPlaylist(playlist);
        })();
        setInterval(async () => {
          const playlist = await getPlaylist();
          setPlaylist(playlist);
        }, 1000 * 20);
      }
    }
  }, undefined);

  const panel = () => {
    if (!playlist) {
      return <LoadingMessagePanel />;
    } else if (playlist?.songs?.page.length == 0) {
      return <div className="message">The playlist is empty. Add a song!</div>;
    } else {
      return (
        <PlaylistView
          playlist={playlist}
          nav={nav}
          currentUser={currentUser}
          voteForSong={voteForSong}
          showToast={() => {
            setToastOpen(true);
          }}
        />
      );
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
