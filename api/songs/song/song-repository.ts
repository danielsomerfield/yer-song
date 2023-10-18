import {
  AttributeValue,
  DynamoDB,
  GetItemCommand,
} from "@aws-sdk/client-dynamodb";
import { logger } from "../util/logger";

import { Song } from "./domain";

export type Maybe<T> = T | undefined;

export interface SongRepository {
  getSongById: (id: string) => Promise<Maybe<Song>>;
}

export const createSongRepository = (client: DynamoDB): SongRepository => {
  return {
    getSongById: async (id: string) => {
      try {
        const maybeSongResponse = await client.send(
          new GetItemCommand({
            Key: {
              id: {
                S: id,
              },
            },
            TableName: "song",
          })
        );

        const maybeItem = maybeSongResponse.Item;

        if (maybeItem) {
          try {
            return {
              id: getRequiredString(maybeItem, "id"),
              title: getRequiredString(maybeItem, "title"),
              artistName: getRequiredString(maybeItem, "artistName"),
            };
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
    },
  };
};

const getRequiredString = (
  item: Record<string, AttributeValue>,
  fieldName: string
): string => {
  const value = item?.[fieldName]?.S;
  if (!value) {
    throw { message: `Missing value for field: '${fieldName}'.` };
  } else {
    return value;
  }
};
