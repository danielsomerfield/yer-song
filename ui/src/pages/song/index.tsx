import styled from "styled-components";
import React, { useEffect, useState } from "react";
import { NavigateFunction, useParams } from "react-router-dom";
import { LoadingMessagePanel } from "../../components/loadingPanel";
import { BackButton, NavPanel } from "../../components/navPanel";
import { SongWithVotes } from "../../domain/song";
import { CurrentUser } from "../../services/userService";
import * as Toast from "@radix-ui/react-toast";

const Title = styled.h1`
  font-size: 1.5em;
  text-align: center;
  overflow-wrap: break-word;
`;

const ArtistName = styled.h1`
  font-size: 1em;
  text-align: center;
`;

const Song = styled.div`
  margin: 2vh 3vh 0 3vh;
  padding: 0 2% 2% 2%;
  border: 5px solid;
  border-image-slice: 1;
  border-image-source: linear-gradient(to right, #b640ff, #90e7b3);
  overflow: hidden;
  overflow-y: scroll;
  max-height: 65%;
`;

type GetSong = (id: string) => Promise<SongWithVotes | undefined>;
type VoteForSong = (id: string) => Promise<void>;

export const AddOrVoteButton = styled.button`
  height: 8vh;
  margin: 2vh;
  padding: 0 3vh 0 3vh;
  background-color: #008a22;
  border: #d1f1e4;
  color: white;
  border-radius: 1vh;
`;

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
      On playlist with {song.voteCount} votes
      <div aria-label={"requested-by"} role={"note"}>
        {voterName ? `Requested by ${voterName}` : ""}
      </div>
    </OnPlayListPanel>
  ) : (
    <div></div>
  );

  return (
    <>
      <Song>
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
    </>
  );
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
}: {
  getSong: GetSong;
  songId?: string;
  voteForSong: VoteForSong;
  currentUser: CurrentUser;
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
}: {
  getSong: GetSong;
  voteForSong: VoteForSong;
  currentUser: CurrentUser;
  nav: NavigateFunction;
}) => {
  const { songId } = useParams();
  return (
    <div className={"SongWithParam"}>
      <SongPage
        getSong={getSong}
        songId={songId}
        voteForSong={voteForSong}
        currentUser={currentUser}
      />

      <NavPanel nav={nav}>
        <BackButton />
      </NavPanel>
    </div>
  );
};
