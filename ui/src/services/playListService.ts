import axios, { Axios } from "axios";
import { createGet } from "../http/serviceClient";
import { Song } from "../domain/song";

interface Configuration {
  songsAPIHostURL: string;
}

type Playlist = {
  songs: {
    page: Song[];
  };
};

export const createGetPlaylist = (
  configuration: Configuration,
  httpClient: Axios = axios,
) => {
  return createGet<Playlist>(configuration, "playlist", httpClient);
};
