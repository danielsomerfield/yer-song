import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { generateResponseHeaders } from "../http/headers";

export interface Dependencies {
  incrementSongVotes: (songId: string) => Promise<number>;
  allowedOrigins: Set<string>;
}

export const createVoteForSongLambda = (dependencies: Dependencies) => {
  const { incrementSongVotes, allowedOrigins } = dependencies;
  return async (
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> => {
    const songId = event.pathParameters?.["songId"];
    if (songId) {
      // TODO (MVP): prevent record if the song doesn't exist
      const updateCount = await incrementSongVotes(songId);
      if (updateCount >= 1) {
        return generateResponseHeaders(event.headers, allowedOrigins, 200, {
          status: "OK",
        });
      } else {
        // TODO (MVP): Handle non success condition
        throw "NYI: voting failed";
      }
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
