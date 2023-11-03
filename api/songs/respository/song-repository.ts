import {
  AttributeValue,
  DynamoDB,
  GetItemCommand,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { logger } from "../util/logger";

import { Song, Songs, SongWithVotes } from "../domain/songs";
import {
  getOptionalInt,
  getRequiredString,
  getStringOrDefault,
} from "./repository";
import { Vote } from "../song/voteForSong";

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
  const createSongFromRecord = (maybeItem: Record<string, AttributeValue>) => ({
    id: getRequiredString(maybeItem, "PK"),
    title: getRequiredString(maybeItem, "title"),
    artistName: getStringOrDefault(maybeItem, "artistName", "unknown"),
    voteCount: getOptionalInt(maybeItem, "voteCount") || 0,
    voters: createVotersList(maybeItem),
  });

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
        page: maybeSongResponse.Items.map((i) => createSongFromRecord(i)),
        thisPage: "",
      };
    } else {
      return {
        page: [],
        thisPage: "",
      };
    }
  };

  const findSongsWithVotes = async () => {
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

    if (maybeSongResponse.Items) {
      return {
        page: maybeSongResponse.Items.map((i) => createSongFromRecord(i))
          .filter((s) => s.voteCount > 0)
          .sort((s1, s2) => {
            return s2.voteCount - s1.voteCount;
          }),
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
      },
      UpdateExpression:
        "SET voteCount = if_not_exists(voteCount, :zero) + :increment, GSI2PK = :playlist",
    });
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
      },
      UpdateExpression: "SET voteCount = :voteCount REMOVE GSI2PK, voters",
    });

    // throw "NYI: need to remove votes";
  };

  return {
    getSongById,
    findSongsByTag,
    findSongsWithVotes,
    addVoteToSong,
    clearVotes,
  };
};
