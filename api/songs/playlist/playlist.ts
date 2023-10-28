import { Paginated, SongWithVotes } from "../domain/songs";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { generateHeadersForSuccessRequest } from "../http/headers";

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
    const page = await findSongsWithVotes();
    const playlist: Playlist = {
      songs: page,
    };
    return generateHeadersForSuccessRequest(
      playlist,
      event.headers,
      allowedOrigins
    );
  };
};
