import { describe, it } from "@jest/globals";
import { createGetTagsByNameLambda, Dependencies } from "./getTags";
import { APIGatewayProxyEvent } from "aws-lambda";

describe("getTags", () => {
  it("returns 500 with empty data when the query fails", async () => {
    const dependencies: Dependencies = {
      allowedOrigins: new Set(),
      getTagsByName: () => {
        return Promise.reject();
      },
    };
    const event = {
      pathParameters: { tagId: "tag" },
      headers: {
        origin: "https://example.com",
      },
    } as unknown as APIGatewayProxyEvent;
    const getTagsByNameLambda = createGetTagsByNameLambda(dependencies);
    const response = await getTagsByNameLambda(event);
    expect(response.statusCode).toEqual(500);
    expect(JSON.parse(response.body)).toMatchObject({
      status: "Error",
      data: [],
    });
  });
});
