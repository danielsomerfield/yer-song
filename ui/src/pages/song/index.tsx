import styled from "styled-components";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { LoadingMessagePanel } from "../../components/loadingPanel";
import { NavPanel } from "../../components/navPanel";
import { SongWithVotes } from "../../domain/song";
import { CurrentUser } from "../../services/userService";

const Title = styled.h1`
  font-size: 2em;
  text-align: center;
  max-height: 4em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ArtistNme = styled.h1`
  font-size: 1.5em;
  text-align: center;
`;

type GetSong = (id: string) => Promise<SongWithVotes | undefined>;
type VoteForSong = (id: string) => Promise<void>;

export const AddOrVoteButton = styled.button`
  height: 12vh;
  margin: 6vh;
`;

export const AddOrVoteButtonPanel = ({
  song,
  voteForSong,
  isOnPlaylist,
  currentUser,
}: {
  song: SongWithVotes;
  voteForSong: VoteForSong;
  isOnPlaylist: boolean;
  currentUser: CurrentUser;
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
        // TODO (MVP): refresh the vote count
        await voteForSong(song.id);
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
}: {
  song: SongWithVotes;
  voteForSong: VoteForSong;
  currentUser: CurrentUser;
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
      <div>
        <Title role={"heading"} aria-level={1} aria-label={"song-title"}>
          {song.title}
        </Title>
        <ArtistNme role={"heading"} aria-level={2} aria-label={"artist-name"}>
          {song.artistName}
        </ArtistNme>
      </div>
      <div>
        <AddOrVoteButtonPanel
          song={song}
          voteForSong={voteForSong}
          isOnPlaylist={isOnPlaylist}
          currentUser={currentUser}
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

export const SongPageContainer = styled.div`
  font-size: 3vh;
`;

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

  const resetSong = () => {
    setSong(undefined);
    setLoadStarted(false);
  };
  useEffect(() => {
    // TODO (MVP): error handling
    if (!loadStarted) {
      setLoadStarted(true);
      (async () => {
        if (!songId) {
          setSong(Maybe.none);
        } else {
          const song = await getSong(songId);
          setSong(Maybe.of(song));
        }
      })();
    }
  }, undefined);

  if (!song) {
    return <LoadingMessagePanel />;
  }
  const voteFn: VoteForSong = async (id: string) => {
    await voteForSong(id);
    // TODO: the resetload could be a little more elegant
    resetSong();
  };

  return song.exists() ? (
    <SongView
      song={song.getValue()}
      voteForSong={voteFn}
      currentUser={currentUser}
    />
  ) : (
    <SongNotFound />
  );
};

// TODO: can we make this injection less redundant?
export const SongPageWithParams = ({
  getSong,
  voteForSong,
  currentUser,
}: {
  getSong: GetSong;
  voteForSong: VoteForSong;
  currentUser: CurrentUser;
}) => {
  const { songId } = useParams();
  return (
    <div className={"SongWithParam"}>
      <SongPageContainer>
        <SongPage
          getSong={getSong}
          songId={songId}
          voteForSong={voteForSong}
          currentUser={currentUser}
        />
        <NavPanel />
      </SongPageContainer>
    </div>
  );
};
