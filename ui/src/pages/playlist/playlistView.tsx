import { Playlist } from "../../domain/playlist";
import { NavigateFunction } from "react-router-dom";
import { CurrentUser } from "../../services/userService";
import { Song, SongWithVotes } from "../../domain/song";
import React, { MouseEventHandler, PropsWithChildren } from "react";
import { ListItem } from "../../components/lists";
import styled from "styled-components";
import { VoteMode } from "../../domain/voting";

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

type VoteForSong = (id: string) => Promise<void>;

const goToSongHandler = (
  song: Song,
  nav: NavigateFunction,
): MouseEventHandler => {
  return () => {
    nav(`/songs/${song.id}`);
  };
};

const SongView = ({ song, nav, children }: SongViewProperties) => {
  return (
    <ListItem
      role={"listitem"}
      aria-label={`song: ${song.title}`}
      data-id={song.id}
    >
      <SongRow>
        <SongTitle onClick={goToSongHandler(song, nav)}>{song.title}</SongTitle>
        <div>{children}</div>
      </SongRow>
    </ListItem>
  );
};

interface SongViewProperties extends PropsWithChildren {
  nav: NavigateFunction;
  song: SongWithVotes;
}

interface PlaylistViewProperties {
  playlist: Playlist;
  nav: NavigateFunction;
  voteForSong: VoteForSong;
  currentUser: CurrentUser;
  showToast: () => void;
  voteMode: VoteMode;
}

export const PlaylistView = (properties: PlaylistViewProperties) => {
  const { playlist, voteMode, currentUser, voteForSong, showToast, nav } =
    properties;
  return (
    <>
      <SongsPanel role={"list"} aria-label={"song-list"}>
        {playlist.songs.page.map((song) => {
          const disableButton =
            song.voters.filter((v) => v.id == currentUser()?.id).length > 0;
          return (
            <SongView nav={properties.nav} song={song} key={song.id}>
              {voteMode == "SINGLE_VOTE" ? (
                <UpVoteButton
                  disabled={disableButton}
                  onClick={async (evt) => {
                    const button = evt.currentTarget;
                    button.disabled = true;
                    await voteForSong(song.id);
                    showToast();
                  }}
                >
                  Up vote
                </UpVoteButton>
              ) : (
                <UpVoteButton onClick={goToSongHandler(song, nav)}>
                  Bid up!
                </UpVoteButton>
              )}
            </SongView>
          );
        })}
      </SongsPanel>
    </>
  );
};
