import {
  AttributeValue,
  DynamoDB,
  GetItemCommand,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { logger } from "../util/logger";

import { Song, Songs } from "../domain/songs";
import { getRequiredString } from "./repository";

export type Maybe<T> = T | undefined;

export interface SongRepository {
  getSongById: (id: string) => Promise<Maybe<Song>>;
  findSongsByTag: (tag: string) => Promise<Songs>;
}

export const createSongRepository = (client: DynamoDB): SongRepository => {
  function createSongFromRecord(maybeItem: Record<string, AttributeValue>) {
    return {
      id: getRequiredString(maybeItem, "PK"),
      title: getRequiredString(maybeItem, "title"),
      artistName: getRequiredString(maybeItem, "artistName"),
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
  return {
    getSongById,
    findSongsByTag,
  };
};
