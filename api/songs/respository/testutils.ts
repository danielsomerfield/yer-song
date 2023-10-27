import { GenericContainer, Wait } from "testcontainers";
import { DynamoDB } from "@aws-sdk/client-dynamodb";

export interface Dynamo {
  stop: () => Promise<void>;
  client(): DynamoDB;
  endpoint: () => string;
}

const startContainer = async () => {
  const dynamoDBContainer = await new GenericContainer("localstack/localstack")
    .withExposedPorts(4566)
    .withExposedPorts(4569)
    .withWaitStrategy(Wait.forLogMessage(/.*Running on https.*/, 2))
    .start();
  const region = "us-west-2";
  const port = dynamoDBContainer.getMappedPort(4566);
  const endpoint = `http://localhost:${port}`;
  return { dynamoDBContainer, region, endpoint };
};

const createSchema = async (client: DynamoDB) => {
  await client.createTable({
    TableName: "song",
    AttributeDefinitions: [
      { AttributeName: "PK", AttributeType: "S" },
      { AttributeName: "SK", AttributeType: "S" },
      { AttributeName: "GSI1PK", AttributeType: "S" },
    ],
    KeySchema: [
      { AttributeName: "PK", KeyType: "HASH" },
      { AttributeName: "SK", KeyType: "RANGE" },
    ],
    ProvisionedThroughput: { WriteCapacityUnits: 1, ReadCapacityUnits: 1 },
    GlobalSecondaryIndexes: [
      {
        IndexName: "GSI1",
        KeySchema: [
          {
            AttributeName: "GSI1PK",
            KeyType: "HASH",
          },
          {
            AttributeName: "SK",
            KeyType: "RANGE",
          },
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
};

export const startDynamo: () => Promise<Dynamo> = async () => {
  const { dynamoDBContainer, region, endpoint } = await startContainer();

  const client = new DynamoDB({
    endpoint,
    region,
    credentials: {
      accessKeyId: "fake",
      secretAccessKey: "fake",
      sessionToken: "fake",
    },
  });
  await createSchema(client);

  return {
    endpoint: () => endpoint,
    client: () => {
      return client;
    },
    stop: async () => {
      if (client) {
        client.destroy();
      }

      if (dynamoDBContainer) {
        await dynamoDBContainer.stop();
      }
    },
  };
};
