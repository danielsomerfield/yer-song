import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

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
        // TODO: handle malformed inputs
        return {
          id: maybeItem["id"].S!,
          name: maybeItem["name"].S!,
          artistName: maybeItem["artistName"].S!,
        };
      } else {
        throw "NYI";
      }
    },
  };
};
