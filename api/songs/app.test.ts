import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { describe, expect, it } from "@jest/globals";
import { createGetSongLambda } from "./app";

describe("the handler", function () {
  it("return song with existing id", async () => {
    const songId = "123";
    const event = {
      pathParameters: { id: songId },
    } as unknown as APIGatewayProxyEvent;
    const dependencies = {
      findSongById: (id: string) => {
        return {
          id: id,
          name: `name-${id}`,
          artistName: `artist-${id}`,
        };
      },
    };
    const getSong = createGetSongLambda(dependencies);

    const result: APIGatewayProxyResult = await getSong(event);

    expect(result.statusCode).toEqual(200);
    expect(result.headers?.["content-type"]).toEqual("application/json");
    expect(JSON.parse(result.body)).toMatchObject({
      id: songId,
      name: `name-${songId}`,
      artistName: `artist-${songId}`,
    });
  });

  it("returns 404 with non-existing id", async () => {
    const event = {
      pathParameters: {},
    } as unknown as APIGatewayProxyEvent;
    const dependencies = {
      findSongById: () => {
        return undefined;
      },
    };
    const getSong = createGetSongLambda(dependencies);
    const result: APIGatewayProxyResult = await getSong(event);

    expect(result.statusCode).toEqual(404);
  });
});
