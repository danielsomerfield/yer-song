import { defaultConfiguration, getAppDependencies } from "./app";
import { v4 as uuidv4 } from "uuid";
import { APIGatewayProxyEvent } from "aws-lambda";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { GenericContainer, StartedTestContainer, Wait } from "testContainers";
import { afterEach } from "node:test";
import { createGetSongLambda } from "./song/getSong";

import { Song } from "./domain/songs";
import { createGetTagsByNameLambda } from "./tags/getTags";
import { Tag, Tags } from "./domain/tags";

describe("the lambda", () => {
  // TODO: refactor
  let dynamoDBContainer: StartedTestContainer;

  let client: DynamoDB;
  let endpoint: string;

  beforeEach(async () => {
    dynamoDBContainer = await new GenericContainer("localstack/localstack")
      .withExposedPorts(4566)
      .withExposedPorts(4569)
      .withWaitStrategy(Wait.forLogMessage(/.*Running on https.*/, 2))
      .start();

    const region = "us-west-2";
    const port = dynamoDBContainer.getMappedPort(4566);
    endpoint = `http://localhost:${port}`;
    client = new DynamoDB({
      endpoint,
      region,
      credentials: {
        accessKeyId: "fake",
        secretAccessKey: "fake",
        sessionToken: "fake",
      },
    });

    // TODO: refactor this with the makefile so we don't have three definitions of the same table
    await client.createTable({
      TableName: "song",
      AttributeDefinitions: [
        { AttributeName: "PK", AttributeType: "S" },
        { AttributeName: "SK", AttributeType: "S" },
        { AttributeName: "entityType", AttributeType: "S" },
      ],
      KeySchema: [
        { AttributeName: "PK", KeyType: "HASH" },
        { AttributeName: "SK", KeyType: "RANGE" },
      ],
      ProvisionedThroughput: { WriteCapacityUnits: 1, ReadCapacityUnits: 1 },
      GlobalSecondaryIndexes: [
        {
          IndexName: "entityTypeGSI",
          KeySchema: [
            { AttributeName: "entityType", KeyType: "HASH" },
            { AttributeName: "SK", KeyType: "RANGE" },
          ],
          Projection: {
            ProjectionType: "ALL",
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
        },
      ],
    });
  }, 60 * 1000);

  afterEach(() => {
    if (dynamoDBContainer) {
      dynamoDBContainer.stop();
    }
    if (client) {
      client.destroy();
    }
  });

  it("loads a song from the path", async () => {
    const songId = `s:${uuidv4()}`;

    const songName = "Money for Nothing";
    const artistName = "Dire Straights";
    await client.putItem({
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
    } as unknown as APIGatewayProxyEvent;

    const getSong = createGetSongLambda(
      getAppDependencies({
        ...defaultConfiguration,
        dynamodb: {
          endpoint,
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
        client.putItem({
          TableName: "song",
          Item: genre,
        })
      )
    );

    const event = {
      pathParameters: { name: tagName },
    } as unknown as APIGatewayProxyEvent;

    const getTagsByName = createGetTagsByNameLambda(
      getAppDependencies({
        ...defaultConfiguration,
        dynamodb: {
          endpoint,
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
