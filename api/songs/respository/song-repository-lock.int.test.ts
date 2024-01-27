import { describe, it, expect, beforeEach } from "@jest/globals";
import { afterEach } from "node:test";
import { createSongRepository } from "./song-repository";
import { SongIds, Songs } from "./sampledata";
import { Dynamo, startDynamo } from "./testutils";

describe("The song repository with lock order", () => {
    let dynamo: Dynamo;

    beforeEach(async () => {
        dynamo = await startDynamo();
        await dynamo.client().putItem(Songs.song3);
        await dynamo.client().putItem(Songs.song4);
        await dynamo.client().putItem(Songs.song5);
      }, 70 * 1000);

    afterEach(async () => {
    await dynamo.stop();
    });

    it("orders by lockorder asc, then vote count desc", async () => {
    const songRepository = createSongRepository(dynamo.client());
    const matches = await songRepository.findSongsWithVotes();
    expect(matches.page.length).toEqual(3);
    expect(matches.page[0].id).toBe(SongIds.song5Id);
    expect(matches.page[1].id).toBe(SongIds.song4Id);
    expect(matches.page[2].id).toBe(SongIds.song3Id);
    });

    it("clears lockOrder when song is removed from playlist", async () => {
      const songRepository = createSongRepository(dynamo.client());
      await songRepository.clearVotes(SongIds.song5Id);

      const songRecord = await dynamo.client().getItem({
        Key: {
          PK: Songs.song5.Item.PK,
          SK: Songs.song5.Item.SK,
        },
        TableName: "song",
      });

      expect(songRecord).toBeDefined();
      expect(songRecord.Item?.["lockOrder"].N).toEqual("0");
    });

    it("clears lockOrder when locked song is unlocked", async () => {
      const songRepository = createSongRepository(dynamo.client());
      await songRepository.clearLockFromSong(SongIds.song5Id);

      const songRecord = await dynamo.client().getItem({
        Key: {
          PK: Songs.song5.Item.PK,
          SK: Songs.song5.Item.SK,
        },
        TableName: "song",
      });

      expect(songRecord).toBeDefined();
      expect(songRecord.Item?.["lockOrder"]).toBeUndefined();
    });
});