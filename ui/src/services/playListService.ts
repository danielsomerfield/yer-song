import axios, { Axios } from "axios";
import { createGet, createGetWithLoadStatus } from "../http/serviceClient";
import { SongWithVotes } from "../domain/song";

interface Configuration {
  songsAPIHostURL: string;
}

type Playlist = {
  songs: {
    page: SongWithVotes[];
  };
};

export const createGetPlaylist = (
  configuration: Configuration,
  httpClient: Axios = axios,
) => {
  return createGetWithLoadStatus<Playlist>(
    configuration,
    "playlist",
    httpClient,
  );
};
