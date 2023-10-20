import axios, { Axios } from "axios";
import { Song } from "./index";
import { createGetForId } from "../../http/serviceClient";

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
