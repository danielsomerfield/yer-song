import styled from "styled-components";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { LoadingMessagePanel } from "../../components/loadingPanel";
import { NavPanel } from "../../components/navPanel";

export interface Song {
  id: string;
  title: string;
  artistName: string;
  voteCount: number;
}

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

type GetSong = (id: string) => Promise<Song | undefined>;
type VoteForSong = (id: string) => Promise<void>;

export const AddOrVoteButton = styled.button`
  height: 12vh;
  margin: 6vh;
`;

export const AddOrVoteButtonPanel = ({
  songId,
  voteForSong,
  isOnPlaylist,
}: {
  songId: string;
  voteForSong: VoteForSong;
  isOnPlaylist: boolean;
}) => {
  const buttonText = isOnPlaylist ? "Up vote" : "Add to playlist";
  return (
    <AddOrVoteButton
      onClick={async () => {
        await voteForSong(songId);
      }}
    >
      {buttonText}
    </AddOrVoteButton>
  );
};

export const OnPlayListPanel = styled.div`
  font-size: 1.25em;
  text-align: center;
  font-style: italic;
`;

export const SongView = ({
  song,
  voteForSong,
}: {
  song: Song;
  voteForSong: VoteForSong;
}) => {
  const isOnPlaylist = song.voteCount > 0;
  const onList = isOnPlaylist ? (
    <OnPlayListPanel>On playlist</OnPlayListPanel>
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
          songId={song.id}
          voteForSong={voteForSong}
          isOnPlaylist={isOnPlaylist}
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
}: {
  getSong: GetSong;
  songId?: string;
  voteForSong: VoteForSong;
}) => {
  const [song, setSong] = useState<Maybe<Song> | undefined>(undefined);
  const [loadStarted, setLoadStarted] = useState(false);

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

  return song.exists() ? (
    <SongView song={song.getValue()} voteForSong={voteForSong} />
  ) : (
    <SongNotFound />
  );
};

// TODO: can we make this injection less redundant?
export const SongPageWithParams = ({
  getSong,
  voteForSong,
}: {
  getSong: GetSong;
  voteForSong: VoteForSong;
}) => {
  const { songId } = useParams();
  return (
    <div className={"SongWithParam"}>
      <SongPageContainer>
        <SongPage getSong={getSong} songId={songId} voteForSong={voteForSong} />
        <NavPanel />
      </SongPageContainer>
    </div>
  );
};
