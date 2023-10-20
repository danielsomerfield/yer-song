import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Tag } from "../domain/tags";

export interface Dependencies {
  allowOrigin: string;
  getTagsByName: (name: string) => Promise<Tag[]>;
}

export const createGetTagsByNameLambda = (dependencies: Dependencies) => {
  const { allowOrigin, getTagsByName } = dependencies;
  return async (
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> => {
    const tagName = event.pathParameters?.["name"];
    if (!tagName) {
      // TODO: return 400
      throw "NYI";
    }
    const page = await getTagsByName(tagName);
    return {
      statusCode: 200,
      headers: {
        "content-type": "application/json",
        "access-control-allow-headers": "Content-Type",
        "access-control-allow-origin": allowOrigin,
        "access-control-allow-methods": "GET, OPTIONS",
      },
      // TODO: add the pagination code
      body: JSON.stringify({ data: { page } }),
    };
  };
};
