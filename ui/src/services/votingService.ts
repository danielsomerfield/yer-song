import axios, { Axios } from "axios";
import { Configuration } from "../configuration";
import { createPost } from "../http/serviceClient";
import { VoteSubmission } from "../domain/voting";

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
    const post = createPost<VoteSubmission>(
      configuration,
      `/vote/songs/${songId}`,
      httpClient,
    );
    const postResult = await post(vote);
    return postResult;
  };
};
