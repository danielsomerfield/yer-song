import { describe, it } from "@jest/globals";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { GenericContainer, StartedTestContainer, Wait } from "testContainers";
import { afterEach } from "node:test";
import { createSongRepository } from "../respository/song-repository";
import { v4 as uuidv4 } from "uuid";

describe("The song repository", () => {
  let dynamoDBContainer: StartedTestContainer;
  let client: DynamoDB;

  beforeEach(async () => {
    dynamoDBContainer = await new GenericContainer("localstack/localstack")
      .withExposedPorts(4566)
      .withExposedPorts(4569)
      .withWaitStrategy(Wait.forLogMessage(/.*Running on https.*/, 2))
      .start();
    const region = "us-west-2";
    const port = dynamoDBContainer.getMappedPort(4566);
    const endpoint = `http://localhost:${port}`;
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
      ],
      KeySchema: [
        { AttributeName: "PK", KeyType: "HASH" },
        { AttributeName: "SK", KeyType: "RANGE" },
      ],
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

  it("loads songs from the database", async () => {
    const songId = uuidv4();
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
          S: "Someone I used to know",
        },
        artistName: {
          S: "Gotye",
        },
      },
    });

    const songRepository = createSongRepository(client);
    const song = await songRepository.getSongById(songId);
    expect(song?.id).toEqual(songId);
  });

  it("returns undefined for a non-existent record", async () => {
    const songId = "nope";

    const songRepository = createSongRepository(client);
    const song = await songRepository.getSongById(songId);
    expect(song?.id).toBeUndefined();
  });

  it("returns undefined if required fields are missing", async () => {
    const songId = uuidv4();
    await client.putItem({
      TableName: "song",
      Item: {
        PK: {
          S: songId,
        },
        SK: {
          S: songId,
        },
        name: {
          S: "Someone I used to know",
        },
      },
    });

    const songRepository = createSongRepository(client);
    const song = await songRepository.getSongById(songId);
    expect(song).toEqual(undefined);
  });
});
