import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Maybe } from "../util/maybe";

import { Song } from "../domain/songs";

export interface Dependencies {
  findSongById: (id: string) => Promise<Maybe<Song>>;
  allowOrigin(origin: string): boolean;
}

export const createGetSongLambda = (dependencies: Dependencies) => {
  const { findSongById, allowOrigin } = dependencies;
  return async (
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> => {
    const id = event.pathParameters?.["id"];
    if (id) {
      const maybeSong = await findSongById(id);

      //TODO: refactor header gen
      const originValue = event.headers["origin"] || "";
      return {
        statusCode: 200,
        //TODO: refactor header gen
        headers: {
          "content-type": "application/json",
          "access-control-allow-headers": "Content-Type",
          "access-control-allow-origin":
            originValue && allowOrigin(originValue) ? originValue : "",
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
