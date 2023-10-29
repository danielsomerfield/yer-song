import { describe, expect, it } from "@jest/globals";
import { createGetSongLambda } from "./getSong";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

describe("song lambda", () => {
  const findHeaderByName = (
    result: APIGatewayProxyResult,
    name: string
  ): string => {
    const found = Object.entries(result.headers || {}).filter(
      (e) => name.toLowerCase() == e[0].toLowerCase()
    );
    if (found.length == 1) {
      return found[0][1].toString().toLowerCase();
    } else {
      throw `Expected one matching item, but found, ${found}`;
    }
  };

  it("generate headers when they match expected UI host", async () => {
    const expectedOrigin = "http://the-ui-host";
    const event = {
      pathParameters: { id: "123" },
      headers: { origin: expectedOrigin },
    } as unknown as APIGatewayProxyEvent;

    const lambda = createGetSongLambda({
      allowedOrigins: new Set([expectedOrigin, "http://anotherAllowed.com"]),
      findSongById: () =>
        Promise.resolve({ id: "", title: "", artistName: "", voteCount: 0 }),
    });
    const response = await lambda(event);
    expect(findHeaderByName(response, "Access-Control-Allow-Origin")).toEqual(
      expectedOrigin
    );
    expect(
      findHeaderByName(response, "Access-Control-Allow-Methods").split(",")
    ).toContain("get");
    expect(
      findHeaderByName(response, "Access-Control-Allow-Methods")
        .split(",")
        .map((x) => x.trim())
    ).toContain("options");
  });

  it("return song with existing id", async () => {
    const songId = "123";
    const event = {
      pathParameters: { id: songId },
      headers: { origin: "http://allowed" },
    } as unknown as APIGatewayProxyEvent;
    const dependencies = {
      findSongById: (id: string) => {
        return Promise.resolve({
          id: id,
          title: `name-${id}`,
          artistName: `artist-${id}`,
          voteCount: 0,
        });
      },
      allowedOrigins: new Set(["http://allowed"]),
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
        voteCount: 0,
      },
    });
  });

  it("returns 404 with non-existing id", async () => {
    const event = {
      pathParameters: {},
      headers: { origin: "http://allowed" },
    } as unknown as APIGatewayProxyEvent;
    const dependencies = {
      findSongById: () => {
        return Promise.resolve(undefined);
      },
      allowedOrigins: new Set(["http://allowed"]),
    };
    const getSong = createGetSongLambda(dependencies);
    const result: APIGatewayProxyResult = await getSong(event);

    expect(result.statusCode).toEqual(404);
  });
});
