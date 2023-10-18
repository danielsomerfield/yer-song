import axios, { Axios } from "axios";
import { Song } from "./index";

interface Configuration {
  songsAPIHostURL: string;
}

export const createSongForIdFn = (
  configuration: Configuration,
  httpClient: Axios = axios,
) => {
  return async (id: string): Promise<Song | undefined> => {
    const url = `${configuration.songsAPIHostURL}/songs/${id}`;
    const response = await httpClient.get(url);

    //TODO: verify the object is structurally correct
    //TODO: verify the status code

    return response.data.data as Song;
  };
};
