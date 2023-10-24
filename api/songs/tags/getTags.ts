import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Tag } from "../domain/tags";

export interface Dependencies {
  allowOrigin(origin: string): boolean;
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

    // TODO: make sure that origin exists
    const originValue = event.headers["origin"];
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
      // TODO: add the pagination code
      body: JSON.stringify({ data: { page } }),
    };
  };
};
