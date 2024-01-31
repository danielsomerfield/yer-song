import React from "react";
import { NavigateFunction, useParams } from "react-router-dom";
import { LoadingMessagePanel } from "../../components/loadingPanel";
import { BackButton, NavPanel } from "../../components/navPanel";
import { SongWithVotes } from "../../domain/song";
import { CurrentUser } from "../../services/userService";
import {
  ArtistName,
  GetSong,
  OnPlayListPanel,
  Song,
  SongContainer,
  SongPage,
  Title,
  useSong,
} from "./common";
import { SubmitDollarVotePanel } from "./submitDollarVotePanel";
import { VoteSubmission } from "../../domain/voting";

type SubmitDollarVoteForSong = (vote: {
  songId: string;
  value: number;
}) => Promise<VoteSubmission>;

// TODO: pull from configuration
const getVenmoRecipient = () => "@Rachel-Nesvig";

export const DollarVoteSongView = ({
  song,
  submitDollarVoteForSong,
}: {
  song: SongWithVotes;
  currentUser: CurrentUser;
  submitDollarVoteForSong: SubmitDollarVoteForSong;
}) => {
  const isOnPlaylist = song.voteCount > 0;

  // TODO: this is a tricky condition so good to add some better testing
  const voterName =
    song.voters && song.voters.length > 0 ? song.voters[0].name : undefined;

  const onList = isOnPlaylist ? (
    <OnPlayListPanel aria-label={"on-playlist"} role={"note"}>
      On playlist with $${song.voteCount} total bid
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
        <SubmitDollarVotePanel
          onSubmit={async (vote) => {
            const result = await submitDollarVoteForSong({
              songId: song.id,
              value: vote.value,
            });

            const note = encodeURIComponent(
              `Song: ${song.title} - RequestId: ${result.requestId}`,
            );
            window.location.href = `https://venmo.com/?txn=pay&audience=friends&recipients=${getVenmoRecipient()}&amount=${
              vote.value
            }&note=${note}`;
          }}
        />
      </div>
      {onList}
    </SongContainer>
  );
};

export const DVSongPage = (
  properties: DVSongPageProperties & { songId: string },
) => {
  const { getSong, submitDollarVoteForSong, currentUser, songId } = properties;

  const song = useSong(songId, getSong);

  if (!song) {
    return <LoadingMessagePanel />;
  } else {
    return (
      <SongPage song={song}>
        <DollarVoteSongView
          song={song}
          currentUser={currentUser}
          submitDollarVoteForSong={submitDollarVoteForSong}
        />
      </SongPage>
    );
  }
};

interface DVSongPageProperties {
  getSong: GetSong;
  currentUser: CurrentUser;
  submitDollarVoteForSong: SubmitDollarVoteForSong;
}

interface DVSongPageExtendedProperties extends DVSongPageProperties {
  nav: NavigateFunction;
}

export const DollarVoteSongPage = (
  properties: DVSongPageExtendedProperties,
) => {
  const { songId } = useParams();
  const { nav } = properties;

  if (!songId) {
    throw `Missing path parameters: ${songId}`;
  }
  return (
    <div className={"SongWithParam"}>
      {DVSongPage({ ...properties, songId })}

      <NavPanel nav={nav}>
        <BackButton />
      </NavPanel>
    </div>
  );
};
