import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  CORSEnabled,
  generateResponseHeadersForDataResponse,
} from "../http/headers";
import { Song } from "../domain/songs";
import { Maybe } from "../util/maybe";
import { User } from "../domain/user";

export interface Dependencies extends CORSEnabled {
  clearVotes: (id: string) => Promise<void>;
  getIdentityFromRequest: (event: APIGatewayProxyEvent) => Maybe<User>;
  findSongById: (id: string) => Promise<Maybe<Song>>;
  increaseLockOrder: (songId: string) => Promise<void>;
  decreaseLockOrder: (songId: string) => Promise<void>;
}

export const createRunAdminCommandLambda = (dependencies: Dependencies) => {
  const {
    clearVotes,
    getIdentityFromRequest,
    findSongById,
    allowedOrigins,
    increaseLockOrder,
    decreaseLockOrder,
  } = dependencies;

  const removeSongCommand = async (params: { songId: string }) => {
    const { songId } = params;
    await clearVotes(songId);
  };

  //TODO: this move stuff is a bit of a tire fire. Probably want to rethink it.
  const moveUpCommand = async (params: { songId: string; identity: User }) => {
    const { songId } = params;

    const songToMove = await findSongById(songId);

    if (songToMove) {
      await increaseLockOrder(songId);
    }
  };

  const moveDownCommand = async (params: {
    songId: string;
    identity: User;
  }) => {
    const { songId } = params;
    const songToMove = await findSongById(songId);
    if (songToMove) {
      await decreaseLockOrder(songId);
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
