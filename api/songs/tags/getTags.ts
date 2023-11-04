import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Tag } from "../domain/tags";
import {
  CORSEnabled,
  generateResponseHeaders,
  generateResponseHeadersForDataResponse,
} from "../http/headers";
import { logger } from "../util/logger";

export interface Dependencies extends CORSEnabled {
  getTagsByName: (name: string) => Promise<Tag[]>;
}

export const createGetTagsByNameLambda = (dependencies: Dependencies) => {
  const { allowedOrigins, getTagsByName } = dependencies;
  return async (
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> => {
    const tagName = event.pathParameters?.["name"];
    if (!tagName) {
      return generateResponseHeaders(event.headers, allowedOrigins, 500, {
        status: "Error",
        data: [],
      });
    }
    try {
      const page = await getTagsByName(tagName);
      return generateResponseHeadersForDataResponse(
        { page },
        event.headers,
        allowedOrigins
      );
    } catch (e) {
      logger.error(e);
      throw e;
    }
  };
};
