import { createGetSongLambda } from "./song/getSong";
import { createSongRepository } from "./song/song-repository";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBClientConfig } from "@aws-sdk/client-dynamodb/dist-types/DynamoDBClient";

const dynamoDBConfiguration: DynamoDBClientConfig = {};

export interface Configuration {
  dynamodb: DynamoDBClientConfig;
}

export const defaultConfiguration: Configuration = {
  dynamodb: dynamoDBConfiguration,
};

export const getSongDependencies = (
  configuration: Configuration = defaultConfiguration
) => {
  const createDynamoClient = () => new DynamoDB(configuration.dynamodb);

  const dynamoClient: DynamoDB = createDynamoClient();

  return {
    findSongById: createSongRepository(dynamoClient).getSongById,
  };
};

export const getSong = createGetSongLambda(getSongDependencies());
