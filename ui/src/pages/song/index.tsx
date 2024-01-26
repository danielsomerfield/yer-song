import styled from "styled-components";
import React, { useEffect, useState } from "react";
import { NavigateFunction, useParams } from "react-router-dom";
import { LoadingMessagePanel } from "../../components/loadingPanel";
import { BackButton, NavPanel } from "../../components/navPanel";
import { SongWithVotes } from "../../domain/song";
import { CurrentUser } from "../../services/userService";
import * as Toast from "@radix-ui/react-toast";
import { VoteMode, VoteModes, VoteSubmission } from "../../domain/voting";
import { SubmitDollarVotePanel } from "./submitDollarVotePanel";

const Title = styled.h1`
  font-size: 1.5em;
  text-align: center;
  overflow-wrap: break-word;
`;

const ArtistName = styled.h1`
  font-size: 1em;
  text-align: center;
`;

const SongContainer = styled.div`
  text-align: center;
  display: flex;
  flex-flow: column;
  align-items: center;
  gap: 1.5em;
`;

const Song = styled.div`
  margin: 2vh 3vh 0 3vh;
  padding: 0 2% 2% 2%;
  border: 5px solid;
  border-image-slice: 1;
  border-image-source: linear-gradient(to right, #b640ff, #90e7b3);
  overflow: hidden;
  max-height: 65%;
`;

type GetSong = (id: string) => Promise<SongWithVotes | undefined>;
type VoteForSong = (id: string) => Promise<void>;

type SubmitDollarVoteForSong = (vote: {
  songId: string;
  value: number;
}) => Promise<VoteSubmission>;

export const AddOrVoteButton = styled.button`
  height: 8vh;
  margin: 2vh;
  padding: 0 3vh 0 3vh;
  background-color: #008a22;
  border: #d1f1e4;
  color: white;
  border-radius: 1vh;
`;

// TODO: BIG OLD CLEANUP REQUIRED
//  This conditional logic in this has gotten a little gnarly. Rather than the conditional logic,
//  it might be better to have common frame and logic, then separate top level components that use them.
//  Either that, or a strategy pattern that determines both the rendering of the button and the submission logic.

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

const OnPlayListPanel = styled.div`
  font-size: 1em;
  text-align: center;
  font-style: italic;
`;

export const SongView = ({
  song,
  voteForSong,
  currentUser,
  voteMode = VoteModes.SINGLE_VOTE,
  submitDollarVoteForSong = async () => {
    //This is here for test backwards compat. The cleanup should get rid of this
    throw "Please reports this as a bug";
  },
  showToast = () => undefined,
}: {
  song: SongWithVotes;
  voteForSong: VoteForSong;
  currentUser: CurrentUser;
  voteMode?: VoteMode;
  submitDollarVoteForSong?: SubmitDollarVoteForSong;
  showToast?: () => void;
}) => {
  const isOnPlaylist = song.voteCount > 0;

  // TODO: this is a tricky condition so good to add some better testing
  const voterName =
    song.voters && song.voters.length > 0 ? song.voters[0].name : undefined;

  const onList = isOnPlaylist ? (
    <OnPlayListPanel aria-label={"on-playlist"} role={"note"}>
      On playlist with {song.voteCount} votes
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
        {/*
          TODO: this is a gnarly pattern. Doing it temporarily because
              the nested component definition is messing up the state on refresh.
              Will replace this with shared state or subcomponents.

        */}
        <ButtonForVoteMode
          submitDollarVoteForSong={submitDollarVoteForSong}
          voteMode={voteMode}
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

const ButtonForVoteMode = ({
  submitDollarVoteForSong,
  voteMode,
  song,
  voteForSong,
  isOnPlaylist,
  currentUser,
  showToast,
}: {
  submitDollarVoteForSong: SubmitDollarVoteForSong;
  voteMode: VoteMode;
  song: SongWithVotes;
  voteForSong: VoteForSong;
  isOnPlaylist: boolean;
  currentUser: CurrentUser;
  showToast: () => void;
}) => {
  // TODO: this is a bit hacky. Vote modes should probably define a range of behaviors intrinsically.
  //  But it's good enough for now.
  if (voteMode == VoteModes.SINGLE_VOTE) {
    return (
      <AddOrVoteButtonPanel
        song={song}
        voteForSong={voteForSong}
        isOnPlaylist={isOnPlaylist}
        currentUser={currentUser}
        showToast={showToast}
      />
    );
  } else if (voteMode == VoteModes.DOLLAR_VOTE) {
    return (
      <SubmitDollarVotePanel
        onSubmit={async (vote) => {
          const result = await submitDollarVoteForSong({
            songId: song.id,
            value: vote.value,
          });

          const note = encodeURIComponent(
            `Song: ${song.title} - RequestId: ${result.requestId} `,
          );
          window.location.href = `https://venmo.com/?txn=pay&audience=friends&recipients=daniel@redwinewintifish.org&amount=${vote.value}&note=${note}`;
        }}
      />
    );
  } else {
    return (
      <div>
        {/*    This means that a bad vote mode was returned. Presumably client and server code are out of sync */}
      </div>
    );
  }
};

const SongNotFound = () => {
  return <div>The song was not found</div>;
};

interface Maybe<T> {
  getValue: () => T;
  exists: () => boolean;
}

// TODO (MVP): test the none case
const Maybe = {
  none: function <T>(): Maybe<T> {
    return {
      getValue: () => {
        throw "NYI: no value";
      },
      exists: () => false,
    };
  },
  of: function <T>(t: T | undefined): Maybe<T> {
    return {
      getValue: () => {
        if (t) {
          return t;
        } else {
          throw "NYI: no value";
        }
      },
      exists: () => t != null,
    };
  },
};

export const SongPage = ({
  getSong,
  songId,
  voteForSong,
  currentUser,
  voteMode = VoteModes.SINGLE_VOTE,
  submitDollarVoteForSong = async () => {
    //This is here for test backwards compat. The cleanup should get rid of this
    throw "Please reports this as a bug";
  },
}: {
  getSong: GetSong;
  songId?: string;
  voteForSong: VoteForSong;
  currentUser: CurrentUser;
  voteMode?: VoteMode;
  submitDollarVoteForSong?: SubmitDollarVoteForSong;
}) => {
  const [song, setSong] = useState<Maybe<SongWithVotes> | undefined>(undefined);
  const [loadStarted, setLoadStarted] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  const resetSong = () => {
    setSong(undefined);
    setLoadStarted(false);
  };

  useEffect(() => {
    async function refreshSong() {
      if (!songId) {
        setSong(Maybe.none);
      } else {
        const song = await getSong(songId);
        setSong(Maybe.of(song));
      }
    }

    if (!loadStarted) {
      setLoadStarted(true);
      (async () => {
        await refreshSong();
        setInterval(async () => {
          await refreshSong();
        }, 10 * 1000);
      })();
    }
  }, undefined);

  if (!song) {
    return <LoadingMessagePanel />;
  }
  const voteFn: VoteForSong = async (id: string) => {
    await voteForSong(id);
    // TODO: the reset could be a little more elegant
    resetSong();
  };

  return song.exists() ? (
    <>
      <SongView
        song={song.getValue()}
        voteForSong={voteFn}
        currentUser={currentUser}
        showToast={() => {
          setToastOpen(true);
        }}
        voteMode={voteMode}
        submitDollarVoteForSong={submitDollarVoteForSong}
      />
      {/*TODO: Refactor this toast code*/}
      <Toast.Root
        className={"Toast"}
        open={toastOpen}
        onOpenChange={setToastOpen}
      >
        <Toast.Description>
          {song?.getValue()?.voters.length > 0
            ? "Your vote has been added"
            : "Your song has been added to the playlist"}
        </Toast.Description>
      </Toast.Root>
    </>
  ) : (
    <SongNotFound />
  );
};

// TODO: can we make this injection less redundant?
export const SongPageWithParams = ({
  getSong,
  voteForSong,
  currentUser,
  nav,
  voteMode = VoteModes.SINGLE_VOTE,
  submitDollarVoteForSong,
}: {
  getSong: GetSong;
  voteForSong: VoteForSong;
  currentUser: CurrentUser;
  nav: NavigateFunction;
  voteMode?: VoteMode;
  submitDollarVoteForSong: SubmitDollarVoteForSong;
}) => {
  const { songId } = useParams();
  return (
    <div className={"SongWithParam"}>
      <SongPage
        getSong={getSong}
        songId={songId}
        voteForSong={voteForSong}
        currentUser={currentUser}
        voteMode={voteMode}
        submitDollarVoteForSong={submitDollarVoteForSong}
      />

      <NavPanel nav={nav}>
        <BackButton />
      </NavPanel>
    </div>
  );
};
