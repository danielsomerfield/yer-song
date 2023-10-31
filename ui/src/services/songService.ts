import axios, { Axios } from "axios";
import { Song } from "../pages/song";
import { createGet } from "../http/serviceClient";

interface Configuration {
  songsAPIHostURL: string;
}

export const createSongForIdFn = (
  configuration: Configuration,
  httpClient: Axios = axios,
) => {
  return async (id: string): Promise<Song> => {
    return createGet<Song>(configuration, `/songs/${id}`, httpClient)();
  };
};

export const createGetSongsByTagId = (
  configuration: Configuration,
  httpClient: Axios = axios,
) => {
  return async (tagId: string): Promise<{ page: Song[] }> => {
    return createGet<{ page: Song[] }>(
      configuration,
      `/tags/${tagId}/songs`,
      httpClient,
    )();
  };
};
