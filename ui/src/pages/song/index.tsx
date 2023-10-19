import styled from "styled-components";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SongControlPanel } from "./songControlPanel";

export interface Song {
  id: string;
  title: string;
  artistName: string;
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

export type GetSong = (id: string) => Promise<Song | undefined>;

export const SongView = ({ song }: { song: Song }) => {
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
    </>
  );
};

const SongNotFound = () => {
  return <div>The song was not found</div>;
};

const SongLoading = () => {
  return <div>Loading...</div>;
};

interface Maybe<T> {
  getValue: () => T;
  exists: () => boolean;
}

// TODO: test the none case
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
        console.log(`getValue: ${t}`, t);
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
  font-size: 3dvh;
`;

export const SongPage = ({
  getSong,
  songId,
}: {
  getSong: GetSong;
  songId?: string;
}) => {
  const [song, setSong] = useState<Maybe<Song> | undefined>(undefined);
  const [loadStarted, setLoadStarted] = useState(false);

  useEffect(() => {
    if (!loadStarted) {
      setLoadStarted(true);
      (async () => {
        if (!songId) {
          setSong(Maybe.none);
        } else {
          const song = await getSong(songId);
          console.log("Setting song to undefined?", song == undefined);
          setSong(Maybe.of(song));
        }
      })();
    }
  }, undefined);

  if (!song) {
    return <SongLoading />;
  } else console.log("exists?", song.exists(), song);

  return song.exists() ? <SongView song={song.getValue()} /> : <SongNotFound />;
};

// TODO: can we make this injection less redundant?
export const SongPageWithParams = ({ getSong }: { getSong: GetSong }) => {
  const { songId } = useParams();
  return (
    <div className={"SongWithParam"}>
      <SongPageContainer>
        <SongPage getSong={getSong} songId={songId} />
      </SongPageContainer>
      <SongControlPanel />
    </div>
  );
};
