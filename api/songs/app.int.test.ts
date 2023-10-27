import { defaultConfiguration, getAppDependencies } from "./app";
import { v4 as uuidv4 } from "uuid";
import { APIGatewayProxyEvent } from "aws-lambda";
import { afterEach } from "node:test";
import { createGetSongLambda } from "./song/getSong";

import { Song } from "./domain/songs";
import { createGetTagsByNameLambda } from "./tags/getTags";
import { Tags } from "./domain/tags";
import { Dynamo, startDynamo } from "./respository/testutils";

describe("the lambda", () => {
  let dynamo: Dynamo;

  beforeEach(async () => {
    dynamo = await startDynamo();
  }, 60 * 1000);

  afterEach(async () => {
    await dynamo.stop();
  });

  it("loads a song from the path", async () => {
    const songId = `s:${uuidv4()}`;

    const songName = "Money for Nothing";
    const artistName = "Dire Straights";
    await dynamo.client().putItem({
      TableName: "song",
      Item: {
        PK: {
          S: songId,
        },
        SK: {
          S: songId,
        },
        title: {
          S: songName,
        },
        artistName: {
          S: artistName,
        },
        entityType: {
          S: "song",
        },
      },
    });

    const event = {
      pathParameters: { id: songId },
      headers: { origin: "localhost" },
    } as unknown as APIGatewayProxyEvent;

    const getSong = createGetSongLambda(
      getAppDependencies({
        ...defaultConfiguration,
        dynamodb: {
          endpoint: dynamo.endpoint(),
          credentials: {
            accessKeyId: "fake",
            secretAccessKey: "fake",
            sessionToken: "fake",
          },
        },
      })
    );
    const result = await getSong(event);
    expect(result.statusCode).toEqual(200);
    const payload = JSON.parse(result.body) as { data: Song };
    expect(payload.data).toMatchObject({
      id: songId,
      title: songName,
      artistName,
    });
  });

  it("loads all tags by name", async () => {
    const tagName = "genre";

    const genres = [
      {
        PK: {
          S: "t:genre",
        },
        SK: {
          S: "t:genre:MovieTVStage",
        },
        entityType: {
          S: "tag",
        },
        tag: {
          S: "genre:Movie, TV, & Stage",
        },
      },
      {
        PK: {
          S: "t:genre",
        },
        SK: {
          S: "t:genre:JazzStandardsOldLoveSongs",
        },
        entityType: {
          S: "tag",
        },
        tag: {
          S: "genre:Jazz Standards and Old Love Songs",
        },
      },
    ];

    await Promise.all(
      genres.map((genre) =>
        dynamo.client().putItem({
          TableName: "song",
          Item: genre,
        })
      )
    );

    const event = {
      pathParameters: { name: tagName },
      headers: { origin: "localhost" },
    } as unknown as APIGatewayProxyEvent;

    const getTagsByName = createGetTagsByNameLambda(
      getAppDependencies({
        ...defaultConfiguration,
        dynamodb: {
          endpoint: dynamo.endpoint(),
          credentials: {
            accessKeyId: "fake",
            secretAccessKey: "fake",
            sessionToken: "fake",
          },
        },
      })
    );

    const result = await getTagsByName(event);
    expect(result.statusCode).toEqual(200);
    const payload = JSON.parse(result.body) as { data: Tags };
    expect(payload.data.page.length).toEqual(2);
    expect(payload.data.page[0]).toMatchObject({
      id: "t:genre:JazzStandardsOldLoveSongs",
      name: "genre",
      value: "Jazz Standards and Old Love Songs",
    });
    expect(payload.data.page[1]).toMatchObject({
      id: "t:genre:MovieTVStage",
      name: "genre",
      value: "Movie, TV, & Stage",
    });
  });
});
