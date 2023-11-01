import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { generateResponseHeaders } from "../http/headers";
import { User } from "../domain/user";
import { Maybe } from "../util/maybe";

export interface Vote {
  voter: User;
  songId: string;
}

export interface Dependencies {
  getIdentityFromRequest: (event: APIGatewayProxyEvent) => Maybe<User>;
  insertVote(vote: Vote): Promise<void>;
  allowedOrigins: Set<string>;
}

export const createVoteForSongLambda = (dependencies: Dependencies) => {
  return async (
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> => {
    const { insertVote, allowedOrigins, getIdentityFromRequest } = dependencies;
    const songId = event.pathParameters?.["songId"];
    const voter = getIdentityFromRequest(event);

    // TODO (mvp): no voter, return 401

    if (songId && voter) {
      // TODO (MVP): prevent record if the song doesn't exist
      await insertVote({ songId, voter });
      return generateResponseHeaders(event.headers, allowedOrigins, 200, {
        status: "OK",
      });
    } else {
      return {
        statusCode: 404,
        headers: {
          "content-type": "application/json",
        },
        body: '{"message":"Missing id"}',
      };
    }
  };
};
