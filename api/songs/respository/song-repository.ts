import {
  AttributeValue,
  DynamoDB,
  GetItemCommand,
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
      console.log("Failed to get song", e);
      return undefined;
    }
  };

  const findSongsByTag = (tag: string): Promise<Songs> => {
    throw "NYI";
  };
  return {
    getSongById,
    findSongsByTag,
  };
};
