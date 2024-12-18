import {
  AttributeValue,
  DynamoDB,
  GetItemCommand,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { logger } from "../util/logger";

import { Paginated, Song, Songs, SongWithVotes } from "../domain/songs";
import {
  getOptionalInt,
  getRequiredString,
  getStringOrDefault,
} from "./repository";
import { DateTime } from "luxon";
import { Vote } from "../song/domain";

const createVotersList = (maybeItem: Record<string, AttributeValue>) => {
  const voterRecords = maybeItem["voters"];
  if (voterRecords) {
    return voterRecords.L?.map((vRecord) => {
      const userRecord = vRecord.M;
      // TODO: look for malformed user records and filter them out
      return {
        id: userRecord?.["id"].S,
        name: userRecord?.["name"].S,
      };
    });
  } else {
    return [];
  }
};

export const createSongRepository = (client: DynamoDB) => {
  const createSongFromRecord = (maybeItem: Record<string, AttributeValue>) => {
    try {
      return {
        id: getRequiredString(maybeItem, "PK"),
        title: getRequiredString(maybeItem, "title"),
        artistName: getStringOrDefault(maybeItem, "artistName", "unknown"),
        voteCount: getOptionalInt(maybeItem, "voteCount") || 0,
        voters: createVotersList(maybeItem),
        lockOrder: getOptionalInt(maybeItem, "lockOrder") || 0,
        firstVoteTime: getOptionalInt(maybeItem, "firstVoteTime"),
      };
    } catch (e) {
      logger.warn(`Filtering out bad record with id '${maybeItem["pk"]}'`);
      return undefined;
    }
  };

  const getSongById = async (id: string): Promise<Song | undefined> => {
    try {
      const maybeSongResponse = await client.send(
        new GetItemCommand({
          Key: {
            PK: {
              S: id,
            },
            SK: {
              S: id,
            },
          },
          TableName: "song",
        })
      );

      if (maybeSongResponse.Item) {
        try {
          return createSongFromRecord(maybeSongResponse.Item);
        } catch (e) {
          logger.error(e, "A malformed record was found in the DB");
          return undefined;
        }
      } else {
        return undefined;
      }
    } catch (e) {
      logger.error("Failed to get song", e);
      return undefined;
    }
  };

  const findSongsByTag = async (tag: string): Promise<Songs> => {
    const maybeSongResponse = await client.send(
      new QueryCommand({
        TableName: "song",
        IndexName: "GSI1",
        KeyConditionExpression: "GSI1PK = :pk AND begins_with(SK, :sk)",
        ExpressionAttributeValues: {
          ":pk": {
            S: tag,
          },
          ":sk": {
            S: "s:",
          },
        },
      })
    );

    if (maybeSongResponse.Items) {
      return {
        page: maybeSongResponse.Items.map((i) =>
          createSongFromRecord(i)
        ).filter((maybeSong) => maybeSong != undefined) as Song[],
        thisPage: "",
      };
    } else {
      return {
        page: [],
        thisPage: "",
      };
    }
  };

  const findSongsWithVotes = async (): Promise<Paginated<SongWithVotes>> => {
    const maybeSongResponse = await client.send(
      new QueryCommand({
        TableName: "song",
        IndexName: "GSI2",
        KeyConditionExpression: "GSI2PK = :pk",
        ExpressionAttributeValues: {
          ":pk": {
            S: "ON_PLAYLIST",
          },
        },
      })
    );

    interface SongWithVoteTime extends Song {
      firstVoteTime?: number;
    }

    const orderByProperties = (
      s1: SongWithVoteTime | undefined,
      s2: SongWithVoteTime | undefined
    ) => {
      if (s1?.lockOrder || s2?.lockOrder) {
        return (s1?.lockOrder || Infinity) - (s2?.lockOrder || Infinity);
      }
      const byVote = (s2?.voteCount || 0) - (s1?.voteCount || 0);
      return byVote != 0
        ? byVote
        : (s1?.firstVoteTime || 0) - (s2?.firstVoteTime || 0);
    };

    if (maybeSongResponse.Items) {
      const songs = maybeSongResponse.Items.map((i) => createSongFromRecord(i))
        .filter((s) => s != undefined && s.voteCount > 0)
        .sort((s1, s2) => {
          return orderByProperties(s1, s2);
        });
      return {
        page: songs as SongWithVotes[],
        thisPage: "",
      };
    } else {
      return {
        page: [],
        thisPage: "",
      };
    }
  };

  const addVoteToSong = async (vote: Vote, increment = 1) => {
    await client.updateItem({
      TableName: "song",
      Key: {
        PK: {
          S: vote.songId,
        },
        SK: {
          S: vote.songId,
        },
      },
      ReturnValues: "UPDATED_NEW",
      ExpressionAttributeValues: {
        ":increment": {
          N: increment.toString(),
        },
        ":zero": {
          N: "0",
        },
        ":playlist": {
          S: "ON_PLAYLIST",
        },
        ":firstVoteTime": {
          N: DateTime.now().toUTC().toMillis().toString(),
        },
      },
      UpdateExpression:
        "SET voteCount = if_not_exists(voteCount, :zero) + :increment, GSI2PK = :playlist, firstVoteTime = :firstVoteTime",
    });
    // TODO: this should be combined with the above so you don't end up with partial updates.
    await client.updateItem({
      TableName: "song",
      Key: {
        PK: {
          S: vote.songId,
        },
        SK: {
          S: vote.songId,
        },
      },
      ReturnValues: "UPDATED_NEW",
      ExpressionAttributeValues: {
        ":voter": {
          L: [
            {
              M: {
                id: {
                  S: vote.voter.id,
                },
                name: {
                  S: vote.voter.name,
                },
              },
            },
          ],
        },
        ":empty": {
          L: [],
        },
      },

      UpdateExpression:
        "SET voters = list_append(if_not_exists(voters, :empty), :voter)",
    });
  };

  const clearVotes = async (id: string): Promise<void> => {
    await client.updateItem({
      TableName: "song",
      Key: {
        PK: {
          S: id,
        },
        SK: {
          S: id,
        },
      },
      ReturnValues: "UPDATED_NEW",
      ExpressionAttributeValues: {
        ":voteCount": {
          N: "0",
        },
        ":lockOrder": {
          N: "0",
        },
      },
      UpdateExpression:
        "SET voteCount = :voteCount, lockOrder = :lockOrder REMOVE GSI2PK, voters",
    });
    // throw "NYI: need to remove votes";
  };

  const addLockToSong = async (id: string): Promise<void> => {
    //TODO: this needs to be rethought.

    // Set all locked to a higher number.
    // TODO: if we sort and increment the lock order, we can retain order
    const withVotes = await findSongsWithVotes();
    const pushDown = withVotes.page
      .filter((song) => song.lockOrder == 1)
      .filter((song) => song.id != id)
      .map((song) => ({
        Update: {
          TableName: "song",
          Key: {
            PK: {
              S: song.id,
            },
            SK: {
              S: song.id,
            },
          },
          ExpressionAttributeValues: {
            ":lockOrder": {
              N: "2",
            },
          },
          UpdateExpression: "SET lockOrder = :lockOrder",
        },
      }));

    // Set new lock to one.
    const pushUp = {
      TableName: "song",
      Key: {
        PK: {
          S: id,
        },
        SK: {
          S: id,
        },
      },
      ExpressionAttributeValues: {
        ":one": {
          N: "1",
        },
        ":playlist": {
          S: "ON_PLAYLIST",
        },
      },
      UpdateExpression: "SET lockOrder = :one, GSI2PK = :playlist",
    };

    await client.transactWriteItems({
      TransactItems: [
        {
          Update: pushUp,
        },
        ...pushDown,
      ],
    });
  };

  const clearLockFromSong = async (id: string): Promise<void> => {
    await client.updateItem({
      TableName: "song",
      Key: {
        PK: {
          S: id,
        },
        SK: {
          S: id,
        },
      },
      ReturnValues: "UPDATED_NEW",
      UpdateExpression: "REMOVE lockOrder",
    });
  };

  const increaseLockOrder = async (id: string): Promise<void> => {
    return await addLockToSong(id);
  };

  const decreaseLockOrder = async (id: string): Promise<void> => {
    await client.updateItem({
      TableName: "song",
      Key: {
        PK: {
          S: id,
        },
        SK: {
          S: id,
        },
      },
      ReturnValues: "UPDATED_NEW",
      ExpressionAttributeValues: {
        ":one": {
          N: "1",
        },
      },
      UpdateExpression: "SET lockOrder = lockOrder - :one",
    });
  };

  const addSong = async (song: Song, tag: string) => {
    const songRecord = {
      TableName: "song",
      Item: {
        PK: {
          S: song.id,
        },
        SK: {
          S: song.id,
        },
        title: {
          S: song.title,
        },
        artistName: {
          S: song.artistName,
        },
        voteCount: {
          N: song.voteCount.toString(),
        },
        voters: { L: [] },
        requests: {
          M: {},
        },
        GSI1PK: {
          S: tag,
        },
      },
    };
    return await client.putItem(songRecord);
  };

  return {
    addSong,
    getSongById,
    findSongsByTag,
    findSongsWithVotes,
    addVoteToSong,
    clearVotes,
    addLockToSong,
    clearLockFromSong,
    increaseLockOrder,
    decreaseLockOrder,
  };
};
