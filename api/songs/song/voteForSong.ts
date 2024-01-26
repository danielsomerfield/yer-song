import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { generateResponseHeaders } from "../http/headers";
import { User } from "../domain/user";
import { Maybe } from "../util/maybe";
import { createDollarVoteModeLambda } from "./dollarVoteLambda";

export interface Vote {
  voter: User;
  songId: string;
}

export interface SongRequestInput {
  voter: User;
  songId: string;
  value: number;
}

export interface Dependencies {
  getIdentityFromRequest: (event: APIGatewayProxyEvent) => Maybe<User>;
  insertVote(vote: Vote): Promise<void>;
  insertSongRequest(request: SongRequestInput): Promise<{ requestId: string }>;
  allowedOrigins: Set<string>;
  voteMode: () => VoteMode;
}

export const VoteModes = {
  SINGLE_VOTE: "SINGLE_VOTE",
  DOLLAR_VOTE: "DOLLAR_VOTE",
} as const;

type VoteMode = keyof typeof VoteModes;

export const createVoteForSongLambda = (dependencies: Dependencies) => {
  const { voteMode } = dependencies;

  // TODO: taking heavy handed if/then approach to this now, but this should be refactored to a strategy pattern
  return voteMode() == VoteModes.SINGLE_VOTE
    ? createSingleUserVoteModeLambda(dependencies)
    : createDollarVoteModeLambda(dependencies);
};

export const createSingleUserVoteModeLambda = (dependencies: Dependencies) => {
  const { insertVote, allowedOrigins, getIdentityFromRequest } = dependencies;
  return async (
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> => {
    const songId = event.pathParameters?.["songId"];
    const voter = getIdentityFromRequest(event);

    // TODO
    //  * We could clean this up and not require checking for user with some better typing
    //  and making getIdentityFromRequest always return a user or fail hard.
    //  * Validate that the user hasn't already voted. Right now that's just UI enforced which isn't safe.
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
