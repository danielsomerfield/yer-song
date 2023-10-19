import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Maybe } from "../util/maybe";
import { Song } from "./domain";

export interface Dependencies {
  findSongById: (id: string) => Promise<Maybe<Song>>;
}

export const createGetSongLambda = (dependencies: Dependencies) => {
  const { findSongById } = dependencies;
  return async (
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> => {
    const id = event.pathParameters?.["id"];
    if (id) {
      const maybeSong = await findSongById(id);
      console.log("Found:", maybeSong);
      return {
        statusCode: 200,
        headers: {
          "content-type": "application/json",
          "access-control-allow-headers": "Content-Type",
          "access-control-allow-origin":
            "https://d2jzo5ab0uypii.cloudfront.net",
          "access-control-allow-methods": "GET, OPTIONS",
        },
        body: JSON.stringify({ data: maybeSong }),
      };
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
