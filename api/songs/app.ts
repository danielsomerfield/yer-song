import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

interface Song {
  id: string;
  name: string;
  artistName: string;
}

type Maybe<T> = T | undefined;

interface Dependencies {
  findSongById: (id: string) => Maybe<Song>;
}

export const createGetSongLambda = (dependencies: Dependencies) => {
  return async (
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> => {
    const id = event.pathParameters?.["id"];
    if (id) {
      const maybeSong = dependencies.findSongById(id);
      return {
        statusCode: 200,
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(maybeSong),
      };
    } else {
      return {
        statusCode: 404,
        headers: {
          "content-type": "application/json",
        },
        body: '{"message":"Missing id"}',
      };
    }
  };
};

export const getSong = createGetSongLambda({
  findSongById: (id) => {
    return {
      id,
      name: `name-${id}`,
      artistName: `artist-${id}`,
    };
  },
});
