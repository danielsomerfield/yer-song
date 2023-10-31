import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Maybe } from "../util/maybe";

import { Song } from "../domain/songs";
import {
  CORSEnabled,
  generateResponseHeadersForDataResponse,
} from "../http/headers";

export interface Dependencies extends CORSEnabled {
  findSongById: (id: string) => Promise<Maybe<Song>>;
}

export const createGetSongLambda = (dependencies: Dependencies) => {
  const { findSongById, allowedOrigins } = dependencies;
  return async (
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> => {
    const id = event.pathParameters?.["id"];
    if (id) {
      const maybeSong = await findSongById(id);

      return generateResponseHeadersForDataResponse(
        maybeSong,
        event.headers,
        allowedOrigins
      );
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
