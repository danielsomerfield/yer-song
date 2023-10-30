import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Songs } from "../domain/songs";
import { generateHeadersForDataResponse } from "../http/headers";
import { logger } from "../util/logger";

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
      // TODO (MVP): return 400
      logger.error("No rag id", tagId);
      throw "NYI: no tagId";
    }
    try {
      const page = await findSongsByTagId(tagId);
      return generateHeadersForDataResponse(
        page,
        event.headers,
        allowedOrigins
      );
    } catch (e) {
      logger.error(e);
      throw e;
    }
  };
};
