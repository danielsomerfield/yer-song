import styled from "styled-components";
import React, { useEffect, useState } from "react";
import { NavigateFunction, useParams } from "react-router-dom";
import { LoadingMessagePanel } from "../../components/loadingPanel";
import { BackButton, NavPanel } from "../../components/navPanel";
import { SongWithVotes } from "../../domain/song";
import { CurrentUser } from "../../services/userService";
import {
  ArtistName,
  OnPlayListPanel,
  Song,
  SongContainer,
  SongNotFound,
  SongPage,
  Title,
  useSong,
} from "./common";

type VoteForSong = (id: string) => Promise<void>;
type GetSong = (id: string) => Promise<SongWithVotes | undefined>;

export const AddOrVoteButton = styled.button`
  height: 8vh;
  margin: 2vh;
  padding: 0 3vh 0 3vh;
  background-color: #008a22;
  border: #d1f1e4;
  color: white;
  border-radius: 1vh;
`;

export const SongView = ({
  song,
  voteForSong,
  currentUser,
  showToast = () => undefined,
}: {
  song: SongWithVotes;
  voteForSong: VoteForSong;
  currentUser: CurrentUser;
  showToast?: () => void;
}) => {
  const isOnPlaylist = song.voteCount > 0;

  // TODO: this is a tricky condition so good to add some better testing
  const voterName =
    song.voters && song.voters.length > 0 ? song.voters[0].name : undefined;

  const onList = isOnPlaylist ? (
    <OnPlayListPanel aria-label={"on-playlist"} role={"note"}>
      On playlist with {song.voteCount} votes;
      <div aria-label={"requested-by"} role={"note"}>
        {voterName ? `Requested by ${voterName}` : ""}
      </div>
    </OnPlayListPanel>
  ) : (
    <div></div>
  );

  return (
    <SongContainer>
      <Song className={"Song"}>
        <Title role={"heading"} aria-level={1} aria-label={"song-title"}>
          {song.title}
        </Title>
        <ArtistName role={"heading"} aria-level={2} aria-label={"artist-name"}>
          {song.artistName}
        </ArtistName>
      </Song>
      <div>
        <AddOrVoteButtonPanel
          song={song}
          voteForSong={voteForSong}
          isOnPlaylist={isOnPlaylist}
          currentUser={currentUser}
          showToast={showToast}
        />
      </div>
      {onList}
    </SongContainer>
  );
};

const AddOrVoteButtonPanel = ({
  song,
  voteForSong,
  isOnPlaylist,
  currentUser,
  showToast = () => undefined,
}: {
  song: SongWithVotes;
  voteForSong: VoteForSong;
  isOnPlaylist: boolean;
  currentUser: CurrentUser;
  showToast: () => void;
}) => {
  const buttonText = isOnPlaylist ? "Up vote" : "Request";
  const disableButton =
    song.voters.filter((v) => v.id == currentUser()?.id).length > 0;
  return (
    <AddOrVoteButton
      disabled={disableButton}
      aria-label={"vote-button"}
      role={"button"}
      onClick={async (evt) => {
        const button = evt.currentTarget;
        button.disabled = true;

        await voteForSong(song.id);
        showToast();
      }}
    >
      {buttonText}
    </AddOrVoteButton>
  );
};

export const SVSongPage = (
  properties: SongPageProperties & { songId: string },
) => {
  const { getSong, voteForSong, currentUser, songId } = properties;
  const [componentVersion, setComponentVersion] = useState(0);

  const refresh = () => {
    setComponentVersion(componentVersion + 1);
  };

  const song = useSong(songId, getSong);
  const voteFn: VoteForSong = async (id: string) => {
    await voteForSong(id);
    refresh();
  };

  return song ? (
    <>
      <SongPage song={song}>
        <SongView song={song} currentUser={currentUser} voteForSong={voteFn} />
      </SongPage>
    </>
  ) : (
    <SongNotFound />
  );
};

interface SongPageProperties {
  getSong: GetSong;
  voteForSong: VoteForSong;
  currentUser: CurrentUser;
}

interface SongPageExtendedProperties extends SongPageProperties {
  nav: NavigateFunction;
}

export const SingleVoteSongPage = (properties: SongPageExtendedProperties) => {
  const { songId } = useParams();
  const { nav } = properties;

  if (!songId) {
    throw `Missing path parameters: ${songId}`;
  }
  return (
    <div className={"SongWithParam"}>
      {SVSongPage({ ...properties, songId })}

      <NavPanel nav={nav}>
        <BackButton />
      </NavPanel>
    </div>
  );
};
