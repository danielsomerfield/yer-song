import axios, { Axios } from "axios";
import { Song } from "../pages/song";
import { createGetForId } from "../http/serviceClient";

interface Configuration {
  songsAPIHostURL: string;
}

export const createSongForIdFn = (
  configuration: Configuration,
  httpClient: Axios = axios,
) => {
  return createGetForId<Song>(
    `${configuration.songsAPIHostURL}/songs`,
    httpClient,
  );
};

export const createGetSongsByTagId = (
  configuration: Configuration,
  httpClient: Axios = axios,
) => {
  return async (tagId: string) => {
    const url = `${configuration.songsAPIHostURL}/tags/${encodeURI(
      tagId,
    )}/songs`;
    const response = await httpClient.get(url);
    return response.data.data.page as Song[];
  };
};
