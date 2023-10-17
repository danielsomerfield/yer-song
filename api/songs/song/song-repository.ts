import {
  AttributeValue,
  DynamoDBClient,
  GetItemCommand,
} from "@aws-sdk/client-dynamodb";
import { logger } from "./logger";

export type Maybe<T> = T | undefined;

export interface Song {
  id: string;
  name: string;
  artistName: string;
}

export interface SongRepository {
  getSongById: (id: string) => Promise<Maybe<Song>>;
}

export const createSongRepository = (
  client: DynamoDBClient
): SongRepository => {
  return {
    getSongById: async (id: string) => {
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
            name: getRequiredString(maybeItem, "name"),
            artistName: getRequiredString(maybeItem, "artistName"),
          };
        } catch (e) {
          logger.error(e, "A malformed record was found in the DB");
          return undefined;
        }
      } else {
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
