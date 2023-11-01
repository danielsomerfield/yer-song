import axios, { Axios } from "axios";
import { createGet } from "../http/serviceClient";
import { Song, SongWithVotes } from "../domain/song";

interface Configuration {
  songsAPIHostURL: string;
}

export const createSongForIdFn = (
  configuration: Configuration,
  httpClient: Axios = axios,
) => {
  return async (id: string): Promise<SongWithVotes> => {
    return createGet<SongWithVotes>(
      configuration,
      `/songs/${id}`,
      httpClient,
    )();
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
