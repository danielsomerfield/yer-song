import { describe, it } from "@jest/globals";
import {
  CreateTableCommand,
  DynamoDBClient,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import { GenericContainer, StartedTestContainer, Wait } from "testContainers";
import { afterEach } from "node:test";
import { createSongRepository } from "./song-repository";
import { v4 as uuidv4 } from "uuid";

describe("The song respository", () => {
  let dynamoDBContainer: StartedTestContainer;
  let client: DynamoDBClient;

  beforeEach(async () => {
    dynamoDBContainer = await new GenericContainer("localstack/localstack")
      .withExposedPorts(4566)
      .withExposedPorts(4569)
      .withWaitStrategy(Wait.forLogMessage(/.*Running on https.*/, 2))
      .start();
    const region = "us-west-2";
    const port = dynamoDBContainer.getMappedPort(4566);
    const endpoint = `http://localhost:${port}`;
    client = new DynamoDBClient({
      endpoint,
      region,
      credentials: {
        accessKeyId: "fake",
        secretAccessKey: "fake",
        sessionToken: "fake",
      },
    });

    // TODO: refactor this with the makefile so we don't have three definitions of the same table
    await client.send(
      new CreateTableCommand({
        TableName: "song",
        AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
        KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
        ProvisionedThroughput: { WriteCapacityUnits: 1, ReadCapacityUnits: 1 },
      })
    );
  }, 60 * 1000);

  afterEach(() => {
    if (dynamoDBContainer) {
      dynamoDBContainer.stop();
    }
    if (client) {
      client.destroy();
    }
  });

  it("loads songs from the database", async () => {
    const songId = uuidv4();
    await client.send(
      new PutItemCommand({
        TableName: "song",
        Item: {
          id: {
            S: songId,
          },
          name: {
            S: "Someone I used to know",
          },
          artistName: {
            S: "Gotye",
          },
        },
      })
    );

    const songRepository = createSongRepository(client);
    const song = await songRepository.getSongById(songId);
    expect(song?.id).toEqual(songId);
  });
});
