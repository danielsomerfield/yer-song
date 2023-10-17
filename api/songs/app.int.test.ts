import { defaultConfiguration, getSongDependencies } from "./app";
import { v4 as uuidv4 } from "uuid";
import { APIGatewayProxyEvent } from "aws-lambda";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { GenericContainer, StartedTestContainer, Wait } from "testContainers";
import { afterEach } from "node:test";
import { createGetSongLambda } from "./song/getSong";
import { Song } from "./song/domain";

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
      AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
      KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
      ProvisionedThroughput: { WriteCapacityUnits: 1, ReadCapacityUnits: 1 },
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
    const songId = uuidv4();

    const songName = "Money for Nothing";
    const artistName = "Dire Straights";
    await client.putItem({
      TableName: "song",
      Item: {
        id: {
          S: songId,
        },
        name: {
          S: songName,
        },
        artistName: {
          S: artistName,
        },
      },
    });

    const event = {
      pathParameters: { id: songId },
    } as unknown as APIGatewayProxyEvent;

    const getSong = createGetSongLambda(
      getSongDependencies({
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
    const song = JSON.parse(result.body) as Song;
    expect(song).toMatchObject({
      id: songId,
      name: songName,
      artistName,
    });
  });
});
