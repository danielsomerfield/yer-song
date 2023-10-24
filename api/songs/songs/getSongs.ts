import { APIGatewayProxyResult } from "aws-lambda";
import { Songs } from "../domain/songs";

export interface Dependencies {
  allowOrigin(origin: string): boolean;
  findSongsByTag: (tag: string) => Promise<Songs>;
}

export const createGetSongsByTag = (dependencies: Dependencies) => {
  const { allowOrigin, findSongsByTag } = dependencies;
  return async (tag: string): Promise<APIGatewayProxyResult> => {
    throw "NYI";
    // return {
    //   statusCode: 200,
    //   headers: {
    //     "content-type": "application/json",
    //     "access-control-allow-headers": "Content-Type",
    //     "access-control-allow-origin": allowOrigin(origin) ? origin : "",
    //     "access-control-allow-methods": "GET, OPTIONS",
    //   },
    //   body: JSON.stringify({ data: findSongsByTag(tag) }),
    // };
  };
};
