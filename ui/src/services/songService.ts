import axios, { Axios } from "axios";
import { createGet, createGetWithLoadStatus } from "../http/serviceClient";
import { Song, SongWithVotes } from "../domain/song";
import { ReturnOrError } from "./common";

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
  return async (tagId: string): Promise<ReturnOrError<{ page: Song[] }>> => {
    return createGetWithLoadStatus<{ page: Song[] }>(
      configuration,
      `/tags/${tagId}/songs`,
      httpClient,
    )();
  };
};
