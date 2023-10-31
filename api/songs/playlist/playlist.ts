import { Paginated, Songs } from "../domain/songs";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { generateResponseHeadersForDataResponse } from "../http/headers";
import { logger } from "../util/logger";

export type Playlist = {
  songs: Songs;
};

export type FindSongsWithVotes = () => Promise<Songs>;

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
      return generateResponseHeadersForDataResponse(
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
