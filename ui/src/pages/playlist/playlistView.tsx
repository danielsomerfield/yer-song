import { Playlist } from "../../domain/playlist";
import { NavigateFunction } from "react-router-dom";
import { CurrentUser } from "../../services/userService";
import { SongWithVotes } from "../../domain/song";
import React, { MouseEventHandler } from "react";
import { ListItem } from "../../components/lists";
import styled from "styled-components";
import { VoteMode, VoteModes } from "../../domain/voting";
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

export const PlaylistView = ({
  playlist,
  nav,
  currentUser,
  voteForSong,
  showToast,
  voteMode,
}: {
  playlist: Playlist;
  nav: NavigateFunction;
  voteForSong: VoteForSong;
  currentUser: CurrentUser;
  showToast: () => void;
  voteMode: VoteMode;
}) => {
  const SongView = (song: SongWithVotes) => {
    const goToSong: MouseEventHandler = () => {
      nav(`/songs/${song.id}`);
    };

    const disableButton =
      song.voters.filter((v) => v.id == currentUser()?.id).length > 0;

    const singleVoteBidButton = (
      <>
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
      </>
    );
    const dollarVoteModeBidButton = (
      <>
        <UpVoteButton onClick={goToSong}>Bid up!</UpVoteButton>
      </>
    );
    const voteButton =
      voteMode == VoteModes.SINGLE_VOTE
        ? singleVoteBidButton
        : dollarVoteModeBidButton;
    return (
      <ListItem
        role={"listitem"}
        key={`song::${song.id}`}
        aria-label={`song: ${song.title}`}
        data-id={song.id}
      >
        <SongRow>
          <SongTitle onClick={goToSong}>{song.title}</SongTitle>
          <div>{voteButton}</div>
        </SongRow>
      </ListItem>
    );
  };

  return (
    <>
      <SongsPanel role={"list"} aria-label={"song-list"}>
        {playlist.songs.page.map((tag) => SongView(tag))}
      </SongsPanel>
    </>
  );
};
