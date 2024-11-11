import React, { useState } from "react";
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
import { VoteStatuses, VoteSubmission } from "../../domain/voting";
import * as Toast from "@radix-ui/react-toast";

type SubmitDollarVoteForSong = (vote: {
  songId: string;
  value: number;
  voucher?: string;
}) => Promise<VoteSubmission>;

// TODO: pull from configuration
const getVenmoRecipient = () => "@Rachel-Nesvig";

export const DollarVoteSongView = ({
  song,
  submitDollarVoteForSong,
  showToast,
}: {
  song: SongWithVotes;
  currentUser: CurrentUser;
  submitDollarVoteForSong: SubmitDollarVoteForSong;
  showToast: (message: string, error: boolean) => void;
}) => {
  const isOnPlaylist = song.voteCount > 0;

  const voterName =
    song.voters && song.voters.length > 0 ? song.voters[0].name : undefined;

  const onList = isOnPlaylist ? (
    <OnPlayListPanel aria-label={"on-playlist"} role={"note"}>
      On playlist with ${song.voteCount} total bid
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
              voucher: vote.voucher,
            });

            if (vote.voucher) {
              if (result.status == "OK") {
                showToast("You song has been added", false);
              } else if (result.status == VoteStatuses.UNKNOWN_VOUCHER) {
                showToast("Please provide a valid voucher code", true);
              } else if (result.status == VoteStatuses.INSUFFICIENT_FUNDS) {
                showToast(`Insufficient credit: ${result.details}`, true);
              }
            } else {
              const note = encodeURIComponent(
                `Song: ${song.title} - RequestId: ${result.requestId}`,
              );
              window.location.href = `https://account.venmo.com/?txn=pay&audience=friends&recipients=${getVenmoRecipient()}&amount=${
                vote.value
              }&note=${note}`;
            }
          }}
        />
      </div>
      {onList}
    </SongContainer>
  );
};

export const DVSongPage = (
  properties: DVSongPageProperties & {
    songId: string;
    showToast: (message: string, error: boolean) => void;
  },
) => {
  const { getSong, submitDollarVoteForSong, currentUser, songId, showToast } =
    properties;

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
          showToast={showToast}
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
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastError, setToastError] = useState(false);
  const { nav } = properties;

  const showToast = (toastMessage: string, error: boolean) => {
    setToastOpen(true);
    setToastMessage(toastMessage);
    setToastError(error);
  };

  if (!songId) {
    throw `Missing path parameters: ${songId}`;
  }
  return (
    <div className={"SongWithParam"}>
      {DVSongPage({ ...properties, songId, showToast })}

      {/*  TODO Factor this out */}
      <Toast.Root
        className={toastError ? "Toast ToastError" : "Toast"}
        open={toastOpen}
        onOpenChange={setToastOpen}
      >
        <Toast.Description>{toastMessage}</Toast.Description>
      </Toast.Root>
      <NavPanel nav={nav}>
        <BackButton />
      </NavPanel>
    </div>
  );
};
