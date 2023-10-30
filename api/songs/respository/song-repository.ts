import {
  AttributeValue,
  DynamoDB,
  GetItemCommand,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { logger } from "../util/logger";

import { Paginated, Song, Songs } from "../domain/songs";
import {
  getOptionalInt,
  getRequiredString,
  getStringOrDefault,
} from "./repository";

export type Maybe<T> = T | undefined;

export interface SongRepository {
  getSongById: (id: string) => Promise<Maybe<Song>>;
  findSongsByTag: (tag: string) => Promise<Songs>;
  findSongsWithVotes: () => Promise<Paginated<Song>>;
  addVoteToSong: (id: string) => Promise<number>;
}

export const createSongRepository = (client: DynamoDB): SongRepository => {
  function createSongFromRecord(maybeItem: Record<string, AttributeValue>) {
    return {
      id: getRequiredString(maybeItem, "PK"),
      title: getRequiredString(maybeItem, "title"),
      artistName: getStringOrDefault(maybeItem, "artistName", "unknown"),
      voteCount: getOptionalInt(maybeItem, "voteCount") || 0,
    };
  }

  const getSongById = async (id: string) => {
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

  const addVoteToSong = async (id: string) => {
    const updated = await client.updateItem({
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
        ":increment": {
          N: "1",
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
    const value = updated.Attributes?.["voteCount"];
    if (value && value.N) {
      return Number.parseInt(value.N);
    } else {
      throw "Update failed. Something went wrong";
    }
  };

  return {
    getSongById,
    findSongsByTag,
    findSongsWithVotes,
    addVoteToSong,
  };
};
