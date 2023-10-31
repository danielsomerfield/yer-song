import axios, { Axios } from "axios";
import { Song } from "../pages/song";
import { createGet } from "../http/serviceClient";

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
