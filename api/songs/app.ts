import { createGetSongLambda } from "./song/getSong";
import { createSongRepository } from "./respository/song-repository";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBClientConfig } from "@aws-sdk/client-dynamodb/dist-types/DynamoDBClient";
import { createGetTagsByNameLambda } from "./tags/getTags";
import { createTagsRepository } from "./respository/tag-repository";

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

export const getAppDependencies = (
  configuration: Configuration = defaultConfiguration
) => {
  const createDynamoClient = () => new DynamoDB(configuration.dynamodb);

  const dynamoClient: DynamoDB = createDynamoClient();

  const allowedOrigins = new Set(configuration.allowOrigin.split(","));
  return {
    findSongById: createSongRepository(dynamoClient).getSongById,
    allowOrigin: (origin: string) => allowedOrigins.has(origin),
    getTagsByName: createTagsRepository(dynamoClient).getTagsByName,
  };
};

export const getSong = createGetSongLambda(getAppDependencies());

export const getTags = createGetTagsByNameLambda(getAppDependencies());
