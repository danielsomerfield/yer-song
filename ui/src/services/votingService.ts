import axios, { Axios } from "axios";
import { Configuration } from "../configuration";
import { createPost } from "../http/serviceClient";
import { VoteSubmission } from "../domain/voting";
import { getToken } from "../http/tokenStore";

export const createVoteForSong = (
  configuration: Configuration,
  httpClient: Axios = axios,
) => {
  return (songId: string): Promise<void> => {
    return createPost<void>(
      configuration,
      `/vote/songs/${songId}`,
      httpClient,
    )();
  };
};

export const createDollarVoteForSong = (
  configuration: Configuration,
  httpClient: Axios = axios,
) => {
  return async (vote: {
    songId: string;
    value: number;
  }): Promise<VoteSubmission> => {
    const { songId } = vote;
    const path = `/vote/songs/${songId}`;
    const url = `${configuration.songsAPIHostURL}${path}`;
    const response = await httpClient.post(url, vote, {
      headers: { "x-token": `Bearer ${getToken()}` },
    });

    const data = response.data;
    return data.data;
  };
};
