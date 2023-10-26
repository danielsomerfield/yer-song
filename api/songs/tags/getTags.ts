import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Tag } from "../domain/tags";
import { generateHeadersForSuccessRequest } from "../http/headers";

export interface Dependencies {
  getTagsByName: (name: string) => Promise<Tag[]>;
  allowedOrigins: Set<string>;
}

export const createGetTagsByNameLambda = (dependencies: Dependencies) => {
  const { allowedOrigins, getTagsByName } = dependencies;
  return async (
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> => {
    const tagName = event.pathParameters?.["tagId"];
    if (!tagName) {
      // TODO: return 400
      throw "NYI";
    }
    const page = await getTagsByName(tagName);

    return generateHeadersForSuccessRequest(
      { page },
      event.headers,
      allowedOrigins
    );
  };
};
