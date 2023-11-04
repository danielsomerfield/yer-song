import { describe, it } from "@jest/globals";
import { createSongRepository } from "./song-repository";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { QueryCommandOutput } from "@aws-sdk/client-dynamodb/dist-types/commands/QueryCommand";

describe("the song repository", () => {
  it("gets a good record by id", async () => {
    const output: QueryCommandOutput = {
      Item: {
        PK: {
          S: "pk",
        },
        title: {
          S: "song title",
        },
      },
    } as unknown as QueryCommandOutput;

    const client: DynamoDB = {
      send: () => {
        return output;
      },
    } as unknown as DynamoDB;

    const songRepository = createSongRepository(client);
    const song = await songRepository.getSongById("pk");
    expect(song).toBeDefined();
    expect(song?.id).toEqual("pk");
  });

  it("returns undefined for a bad record", async () => {
    const output: QueryCommandOutput = {
      Item: {
        PK: {
          S: "pk",
        },
      },
    } as unknown as QueryCommandOutput;
    const client: DynamoDB = {
      send: () => {
        return output;
      },
    } as unknown as DynamoDB;

    const songRepository = createSongRepository(client);
    const song = await songRepository.getSongById("pk");
    expect(song).toBeUndefined();
  });

  it("returns list of matching records", async () => {
    const output: QueryCommandOutput = {
      Items: [
        {
          PK: {
            S: "pk1",
          },
          title: {
            S: "song title 1",
          },
        },
        {
          PK: {
            S: "pk2",
          },
          title: {
            S: "song title 2",
          },
        },
      ],
    } as unknown as QueryCommandOutput;
    const client: DynamoDB = {
      send: () => {
        return output;
      },
    } as unknown as DynamoDB;

    const songRepository = createSongRepository(client);
    const songs = await songRepository.findSongsByTag("tag");
    expect(songs.page.length).toEqual(2);
    expect(songs.page.map((s) => s.id)).toEqual(["pk1", "pk2"]);
  });

  it("filters out bad records", async () => {
    const output: QueryCommandOutput = {
      Items: [
        {
          PK: {
            S: "pk1",
          },
          title: {
            S: "song title 1",
          },
        },
        {
          PK: {
            S: "bad record",
          },
        },
      ],
    } as unknown as QueryCommandOutput;
    const client: DynamoDB = {
      send: () => {
        return output;
      },
    } as unknown as DynamoDB;

    const songRepository = createSongRepository(client);
    const songs = await songRepository.findSongsByTag("tag");
    expect(songs.page.length).toEqual(1);
    expect(songs.page.map((s) => s.id)).toEqual(["pk1"]);
  });
});
