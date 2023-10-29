import { Paginated, SongWithVotes } from "../domain/songs";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { generateHeadersForDataResponse } from "../http/headers";
import { logger } from "../util/logger";

export type Playlist = {
  songs: Paginated<SongWithVotes>;
};

export type FindSongsWithVotes = () => Promise<Paginated<SongWithVotes>>;

export interface Dependencies {
  allowedOrigins: Set<string>;
  findSongsWithVotes: FindSongsWithVotes;
}

export const createGetPlaylist = (dependencies: Dependencies) => {
  const { findSongsWithVotes, allowedOrigins } = dependencies;
  return async (
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> => {
    try {
      const page = await findSongsWithVotes();
      const playlist: Playlist = {
        songs: page,
      };
      return generateHeadersForDataResponse(
        playlist,
        event.headers,
        allowedOrigins
      );
    } catch (e) {
      logger.error(e);
      throw e;
    }
  };
};
