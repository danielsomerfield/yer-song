import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Songs } from "../domain/songs";
import { generateHeadersForSuccessRequest } from "../http/headers";

export interface Dependencies {
  allowedOrigins: Set<string>;
  findSongsByTagId: (tagId: string) => Promise<Songs>;
}

export const createGetSongsByTagIdLambda = (dependencies: Dependencies) => {
  const { allowedOrigins, findSongsByTagId } = dependencies;
  return async (
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> => {
    const tagId = event.pathParameters?.["tagId"];
    if (!tagId) {
      // TODO: return 400
      throw "NYI: no ";
    }
    const page = await findSongsByTagId(tagId);

    return generateHeadersForSuccessRequest(
      page,
      event.headers,
      allowedOrigins
    );
  };
};
