import { describe, it } from "@jest/globals";
import { afterEach } from "node:test";
import { createSongRepository } from "./song-repository";
import { GenreIds, SongIds, Songs } from "./sampledata";
import { Dynamo, startDynamo } from "./testutils";

describe("The song repository", () => {
  let dynamo: Dynamo;

  beforeEach(async () => {
    dynamo = await startDynamo();
    await dynamo.client().putItem(Songs.song1);
    await dynamo.client().putItem(Songs.song2);
    await dynamo.client().putItem(Songs.song3);
  }, 60 * 1000);

  afterEach(async () => {
    await dynamo.stop();
  });

  it("loads songs from the database", async () => {
    const songRepository = createSongRepository(dynamo.client());
    const song = await songRepository.getSongById(SongIds.song1Id);
    expect(song?.id).toEqual(SongIds.song1Id);
  });

  it("returns undefined for a non-existent record", async () => {
    const songId = "nope";

    const songRepository = createSongRepository(dynamo.client());
    const song = await songRepository.getSongById(songId);
    expect(song?.id).toBeUndefined();
  });

  it("returns undefined if required fields are missing", async () => {
    const songId = "s:1";

    const songRepository = createSongRepository(dynamo.client());
    const song = await songRepository.getSongById(songId);
    expect(song).toEqual(undefined);
  });

  it("finds songs by tag", async () => {
    const songRepository = createSongRepository(dynamo.client());
    const matches = await songRepository.findSongsByTag(GenreIds.genre1);
    expect(matches.page.length).toEqual(2);
    expect(matches.page[0]).toMatchObject({
      id: SongIds.song1Id,
      title: Songs.song1.Item.title.S,
      artistName: Songs.song1.Item.artistName.S,
    });
    expect(matches.page[1]).toMatchObject({
      id: SongIds.song3Id,
      title: Songs.song3.Item.title.S,
      artistName: Songs.song3.Item.artistName.S,
    });
  });

  it("finds songs with votes > 0 ordered by vote count desc", async () => {
    const songRepository = createSongRepository(dynamo.client());
    const matches = await songRepository.findSongsWithVotes();
    expect(matches.page.length).toEqual(2);
    expect(matches.page[0]).toMatchObject({
      id: SongIds.song3Id,
      title: Songs.song3.Item.title.S,
      artistName: Songs.song3.Item.artistName.S,
    });
    expect(matches.page[1]).toMatchObject({
      id: SongIds.song2Id,
      title: Songs.song2.Item.title.S,
      artistName: Songs.song2.Item.artistName.S,
    });
  });
});
