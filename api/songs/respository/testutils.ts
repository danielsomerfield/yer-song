import { GenericContainer, Wait } from "testcontainers";
import { CreateTableCommandInput, DynamoDB } from "@aws-sdk/client-dynamodb";
import * as fs from "fs";

export interface Dynamo {
  stop: () => Promise<void>;
  client(): DynamoDB;
  endpoint: () => string;
}

const startContainer = async () => {
  const dynamoDBContainer = await new GenericContainer("localstack/localstack")
    .withExposedPorts(4566)
    .withExposedPorts(4569)
    .withWaitStrategy(Wait.forLogMessage(/.*Ready.*/, 1))
    .start();
  const region = "us-west-2";
  const port = dynamoDBContainer.getMappedPort(4566);
  const endpoint = `http://localhost:${port}`;
  return { dynamoDBContainer, region, endpoint };
};

const createSchema = async (client: DynamoDB) => {
  const fileContents = fs.readFileSync(
    `${__dirname}/../../tables/song.table.json`,
    { encoding: "utf-8" }
  );
  const tableDefinition: CreateTableCommandInput = JSON.parse(fileContents);

  await client.createTable(tableDefinition);
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
