import axios, { Axios } from "axios";
import { Song } from "../pages/song";
import { createGetForId } from "../http/serviceClient";

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
  return async () => {
    const url = `${configuration.songsAPIHostURL}/playlist`;
    const response = await httpClient.get(url);
    const data = response.data;
    return data.data as Playlist;
  };
};
