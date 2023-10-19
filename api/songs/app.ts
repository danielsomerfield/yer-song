import { createGetSongLambda } from "./song/getSong";
import { createSongRepository } from "./song/song-repository";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBClientConfig } from "@aws-sdk/client-dynamodb/dist-types/DynamoDBClient";

console.log("Running with environment", process.env);

const getDynamoEndpoint = () => {
  const endpoint = process.env.API_ENDPOINT;
  return endpoint == undefined || endpoint.trim().length == 0
    ? undefined
    : endpoint;
};

const dynamoDBConfiguration: DynamoDBClientConfig = {
  // TODO this should be nothing production, localhost in api tests outside of docker, and host.docker.internal for
  //  running inside of docker (like in sam local)
  // endpoint: "http://localhost:4566",
  endpoint: getDynamoEndpoint(),
};

export interface Configuration {
  dynamodb: DynamoDBClientConfig;
  allowOrigin: string;
}

export const defaultConfiguration: Configuration = {
  dynamodb: dynamoDBConfiguration,
  allowOrigin: process.env["ALLOW_ORIGIN"] || "http://localhost:3001",
};

export const getSongDependencies = (
  configuration: Configuration = defaultConfiguration
) => {
  const createDynamoClient = () => new DynamoDB(configuration.dynamodb);

  const dynamoClient: DynamoDB = createDynamoClient();

  return {
    findSongById: createSongRepository(dynamoClient).getSongById,
    allowOrigin: configuration.allowOrigin,
  };
};

export const getSong = createGetSongLambda(getSongDependencies());
