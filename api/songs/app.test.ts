import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { describe, expect, it } from "@jest/globals";

import { createGetSongLambda } from "./song/getSong";

describe("the handler", function () {
  it("return song with existing id", async () => {
    const songId = "123";
    const event = {
      pathParameters: { id: songId },
    } as unknown as APIGatewayProxyEvent;
    const dependencies = {
      findSongById: (id: string) => {
        return Promise.resolve({
          id: id,
          title: `name-${id}`,
          artistName: `artist-${id}`,
        });
      },
      allowOrigin: "",
    };
    const getSong = createGetSongLambda(dependencies);

    const result: APIGatewayProxyResult = await getSong(event);

    expect(result.statusCode).toEqual(200);
    expect(result.headers?.["content-type"]).toEqual("application/json");
    expect(JSON.parse(result.body)).toMatchObject({
      data: {
        id: songId,
        title: `name-${songId}`,
        artistName: `artist-${songId}`,
      },
    });
  });

  it("returns 404 with non-existing id", async () => {
    const event = {
      pathParameters: {},
    } as unknown as APIGatewayProxyEvent;
    const dependencies = {
      findSongById: () => {
        return Promise.resolve(undefined);
      },
      allowOrigin: "",
    };
    const getSong = createGetSongLambda(dependencies);
    const result: APIGatewayProxyResult = await getSong(event);

    expect(result.statusCode).toEqual(404);
  });
});
