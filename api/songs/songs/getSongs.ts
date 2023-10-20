import { APIGatewayProxyResult } from "aws-lambda";
import { Songs } from "../domain/songs";

export interface Dependencies {
  allowOrigin: string;
  findSongsByTag: (tag: string) => Promise<Songs>;
}

export const createGetSongsByTag = (dependencies: Dependencies) => {
  const { allowOrigin, findSongsByTag } = dependencies;
  return async (tag: string): Promise<APIGatewayProxyResult> => {
    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
        "access-control-allow-headers": "Content-Type",
        "access-control-allow-origin": allowOrigin,
        "access-control-allow-methods": "GET, OPTIONS",
      },
      body: JSON.stringify({ data: findSongsByTag(tag) }),
    };
  };
};
