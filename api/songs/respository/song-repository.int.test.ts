import { describe, it } from "@jest/globals";
import { afterEach } from "node:test";
import { createSongRepository } from "./song-repository";
import { GenreIds, SongIds, Songs, Users } from "./sampledata";
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
      voters: [
        {
          id: Users.user1.M.id.S,
          name: Users.user1.M.name.S,
        },
        {
          id: Users.user2.M.id.S,
          name: Users.user2.M.name.S,
        },
        {
          id: Users.user3.M.id.S,
          name: Users.user3.M.name.S,
        },
        {
          id: Users.user4.M.id.S,
          name: Users.user4.M.name.S,
        },
      ],
      voteCount: 4,
    });
    expect(matches.page[1]).toMatchObject({
      id: SongIds.song2Id,
      title: Songs.song2.Item.title.S,
      artistName: Songs.song2.Item.artistName.S,
      voters: [
        {
          id: Users.user2.M.id.S,
          name: Users.user2.M.name.S,
        },
      ],
      voteCount: 1,
    });
  });

  describe("voting", () => {
    const voter = {
      id: Users.user1.M.id.S,
      name: Users.user1.M.name.S,
    };

    it("sets songs with no votes to 1", async () => {
      const songRepository = createSongRepository(dynamo.client());
      await songRepository.addVoteToSong({
        songId: SongIds.song1Id,
        voter,
      });
      const songsWithVotes = await songRepository.findSongsWithVotes();
      const song1 = songsWithVotes.page.filter(
        (s) => s.id == SongIds.song1Id
      )[0];
      expect(song1).toBeDefined();
      expect(song1.voteCount).toEqual(1);
    });

    it("increment songs with votes already", async () => {
      const songRepository = createSongRepository(dynamo.client());
      await songRepository.addVoteToSong({ songId: SongIds.song2Id, voter });
      const songsWithVotes = await songRepository.findSongsWithVotes();
      const song2 = songsWithVotes.page.filter(
        (s) => s.id == SongIds.song2Id
      )[0];
      expect(song2).toBeDefined();
      expect(song2.voteCount).toEqual(2);
    });

    it("increments by more than one", async () => {
      const songRepository = createSongRepository(dynamo.client());
      await songRepository.addVoteToSong({ songId: SongIds.song2Id, voter }, 5);
      const songsWithVotes = await songRepository.findSongsWithVotes();
      const song2 = songsWithVotes.page.filter(
        (s) => s.id == SongIds.song2Id
      )[0];
      expect(song2.voteCount).toEqual(6);
    });
  });

  describe("mutation", () => {
    it("updates song records with vote data", async () => {
      const songRepository = createSongRepository(dynamo.client());
      await songRepository.clearVotes(SongIds.song2Id);

      const songRecord = await dynamo.client().getItem({
        Key: {
          PK: Songs.song2.Item.PK,
          SK: Songs.song2.Item.SK,
        },
        TableName: "song",
      });

      expect(songRecord).toBeDefined();
      expect(songRecord.Item?.["voteCount"].N).toEqual("0");
      expect(songRecord.Item?.["GSI2PK"]).toBeUndefined();
      expect(songRecord.Item?.["voters"]).toBeUndefined();
    });

    // TODO: test non-zeroing out case
  });
});
