import axios, { Axios } from "axios";
import { Configuration } from "../configuration";

export const createVoteForSong = (
  configuration: Configuration,
  httpClient: Axios = axios,
) => {
  return async (songId: string): Promise<void> => {
    const url = `${configuration.songsAPIHostURL}/vote/songs/${songId}`;
    const response = await httpClient.post(url);
    if (response.status != 200) {
      console.log("Vote failed with error code", response.status);
      throw "Voting failed";
    }
  };
};
