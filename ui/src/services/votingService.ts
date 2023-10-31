import axios, { Axios } from "axios";
import { Configuration } from "../configuration";
import { createPost } from "../http/serviceClient";

export const createVoteForSong = (
  configuration: Configuration,
  httpClient: Axios = axios,
) => {
  return (songId: string): Promise<void> => {
    return createPost<void>(
      configuration,
      `vote/songs/${songId}`,
      httpClient,
    )();
  };
};
