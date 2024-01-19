import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  CORSEnabled,
  generateResponseHeadersForDataResponse,
} from "../http/headers";
import { Song, Songs } from "../domain/songs";
import { Vote } from "../song/voteForSong";
import { Maybe } from "../util/maybe";
import { User } from "../domain/user";

export interface Dependencies extends CORSEnabled {
  clearVotes: (id: string) => Promise<void>;
  findSongsWithVotes: () => Promise<Songs>;
  insertVote: (vote: Vote, count: number) => Promise<void>;
  getIdentityFromRequest: (event: APIGatewayProxyEvent) => Maybe<User>;
  findSongById: (id: string) => Promise<Maybe<Song>>;
}

export const createRunAdminCommandLambda = (dependencies: Dependencies) => {
  const {
    clearVotes,
    findSongsWithVotes,
    insertVote,
    getIdentityFromRequest,
    findSongById,
    allowedOrigins,
  } = dependencies;

  const removeSongCommand = async (params: { songId: string }) => {
    const { songId } = params;
    await clearVotes(songId);
  };

  //TODO: this move stuff is a bit of a tire fire. Probably want to rethink it.
  const moveUpCommand = async (params: { songId: string; identity: User }) => {
    const { songId, identity } = params;

    const songToMove = await findSongById(songId);
    const paginatedPlaylist = await findSongsWithVotes();
    const playlistSongs = paginatedPlaylist.page;
    const index = playlistSongs.findIndex((s) => s.id == songId);
    if (index > 0) {
      const songToReplace = playlistSongs[index - 1];
      const songToReplaceVoteCount = songToReplace.voteCount;
      if (songToReplaceVoteCount && songToMove) {
        const additionalVotes =
          songToReplaceVoteCount - songToMove.voteCount + 1;
        await insertVote({ songId, voter: identity }, additionalVotes);
      } else {
        console.log(
          "No vote found. Skipping. This could be an unavoidable race condition condition"
        );
      }
    } else {
      console.log("Nowhere to go. Already at the top");
    }
  };

  const moveDownCommand = async (params: {
    songId: string;
    identity: User;
  }) => {
    {
      const { songId, identity } = params;

      const songToMove = await findSongById(songId);
      const paginatedPlaylist = await findSongsWithVotes();
      const playListSongs = paginatedPlaylist.page;
      const index = playListSongs.findIndex((s) => s.id == songId);
      if (index <= playListSongs.length - 1) {
        const songToReplace = playListSongs[index + 1];
        const songToReplaceVoteCount = songToReplace.voteCount;
        if (songToReplaceVoteCount && songToMove) {
          const votesToRemove =
            songToReplaceVoteCount - 1 - songToMove.voteCount;
          await insertVote({ songId, voter: identity }, votesToRemove);
        } else {
          console.log(
            "No vote found. Skipping. This could be an unavoidable race condition condition"
          );
        }
      } else {
        console.log("Nowhere to go. Already at the top");
      }
    }
  };
  const commands = {
    remove: removeSongCommand,
    moveDown: moveDownCommand,
    moveUp: moveUpCommand,
  };

  return async (
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> => {
    const resource = event.pathParameters?.resource;
    const command = event.pathParameters?.command;

    const identity = getIdentityFromRequest(event);

    if (!resource || !command) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          status: "ERR",
          message: "missing required fields",
        }),
      };
    }
    const toExecute = commands[command as keyof typeof commands];

    if (toExecute && identity) {
      await toExecute({ songId: resource, identity });
    }

    return generateResponseHeadersForDataResponse(
      {},
      event.headers,
      allowedOrigins
    );
  };
};
