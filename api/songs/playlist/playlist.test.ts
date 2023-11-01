import { describe, it } from "@jest/globals";
import { Songs } from "../domain/songs";
import { APIGatewayProxyEvent } from "aws-lambda";
import * as Playlist from "./playlist";
import { verifyCORSHeaders } from "../http/headers.testing";

describe("getPlaylist", () => {
  it("return the playlist", async () => {
    const songs: Songs = {
      thisPage: "",
      nextPage: "",
      page: [
        {
          id: "s:id2",
          title: "song 2",
          artistName: "artist 2",
          voteCount: 10,
        },
        {
          id: "s:id3",
          title: "song 3",
          artistName: "artist 3",
          voteCount: 2,
        },
        {
          id: "s:id1",
          title: "song 1",
          artistName: "artist 1",
          voteCount: 1,
        },
      ],
    };

    const origin = "https://example.com";

    const event = {
      headers: { origin },
    } as unknown as APIGatewayProxyEvent;

    const findSongsWithVotes: () => Promise<Songs> = async () => {
      return songs;
    };

    const dependencies: Playlist.Dependencies = {
      findSongsWithVotes: findSongsWithVotes,
      allowedOrigins: new Set([origin]),
    };

    const getPlaylist = Playlist.createGetPlaylist(dependencies);
    const result = await getPlaylist(event);
    const playlist = JSON.parse(result.body).data;
    expect(playlist.songs.page.length).toEqual(3);
    expect(playlist.songs.page).toMatchObject([
      {
        id: "s:id2",
        title: "song 2",
        artistName: "artist 2",
        voteCount: 10,
      },
      {
        id: "s:id3",
        title: "song 3",
        artistName: "artist 3",
        voteCount: 2,
      },
      {
        id: "s:id1",
        title: "song 1",
        artistName: "artist 1",
        voteCount: 1,
      },
    ]);

    verifyCORSHeaders(result, origin);
  });
});
