import styled from "styled-components";
import {useEffect, useState} from "react";

export interface Song {
    id: string;
    title: string;
    artist: string;
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

export type GetSong = () => Promise<Song | undefined>;

export const SongView = ({song}: { song: Song }) => {
    return <div>
        <Title role={"heading"} aria-level={1} aria-label={"song-title"}>{song.title}</Title>
        <ArtistNme role={"heading"} aria-level={2} aria-label={"artist-name"}>{song.artist}</ArtistNme>
    </div>;
};


const SongNotFound = () => {
    return <div>The song was not found</div>;
};


export const SongPage = ({getSong}: { getSong: GetSong }) => {
    const [song, setSong] =
        useState<Song | undefined>(undefined);

    useEffect(() => {
        (async () => {
            const song = await getSong();
            setSong(song);
        })();

    }, undefined);
    return song ? <SongView song={song}/> : <SongNotFound/>;
};
