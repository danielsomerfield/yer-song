import { describe, it } from "@jest/globals";
import { Songs } from "../domain/songs";
import { createGetSongsByTagIdLambda } from "./getSongs";
import { APIGatewayProxyEvent } from "aws-lambda";
import { verifyCORSHeaders } from "../http/headers.testing";

describe("getSongsByTag", () => {
  const matchingTagId = "t:tag1=value1";
  const origin = "https://example.com";

  const findSongsByTagId = async (tagId: string): Promise<Songs> => {
    return tagId == matchingTagId
      ? {
          page: [
            {
              id: "id1",
              title: "Song 1",
              artistName: "Artist 1",
              voteCount: 0,
            },
            {
              id: "id2",
              title: "Song 2",
              artistName: "Artist 2",
              voteCount: 0,
            },
          ],
          thisPage: "0",
        }
      : { page: [], thisPage: "" };
  };

  const getSongsByTagId = createGetSongsByTagIdLambda({
    findSongsByTagId,
    allowedOrigins: new Set([origin]),
  });

  it("returns a paginated list of songs base from the tag", async () => {
    const event = {
      pathParameters: { tagId: matchingTagId },
      headers: { origin },
    } as unknown as APIGatewayProxyEvent;

    const result = await getSongsByTagId(event);
    expect(result.statusCode).toEqual(200);
    expect(result.body).toBeDefined();
    const songs = JSON.parse(result.body).data as Songs;
    expect(songs.page.length).toEqual(2);
    expect(songs.page.map((s) => s.id)).toEqual(["id1", "id2"]);
    expect(songs.page.map((s) => s.title)).toEqual(["Song 1", "Song 2"]);
    expect(songs.page.map((s) => s.artistName)).toEqual([
      "Artist 1",
      "Artist 2",
    ]);
    verifyCORSHeaders(result, origin);
  });

  it("returns nothing if there is no match", async () => {
    const event = {
      pathParameters: { tagId: "not-a-match" },
      headers: { origin },
    } as unknown as APIGatewayProxyEvent;

    const result = await getSongsByTagId(event);
    expect(result.statusCode).toEqual(200);
    expect(result.body).toBeDefined();
    const songs = JSON.parse(result.body).data as Songs;
    expect(songs.page.length).toEqual(0);
    verifyCORSHeaders(result, origin);
  });
});
