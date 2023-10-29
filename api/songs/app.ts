import { createGetSongLambda } from "./song/getSong";
import { createSongRepository } from "./respository/song-repository";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBClientConfig } from "@aws-sdk/client-dynamodb/dist-types/DynamoDBClient";
import { createGetTagsByNameLambda } from "./tags/getTags";
import { createTagsRepository } from "./respository/tag-repository";
import { createGetSongsByTagIdLambda } from "./songs/getSongs";
import { createGetPlaylist } from "./playlist/playlist";
import { createVoteForSongLambda } from "./song/voteForSong";

const getDynamoEndpoint = () => {
  const endpoint = process.env.API_ENDPOINT;
  return endpoint == undefined || endpoint.trim().length == 0
    ? undefined
    : endpoint;
};

const dynamoDBConfiguration: DynamoDBClientConfig = {
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
  const tagsRepository = createTagsRepository(dynamoClient);
  const songsRepository = createSongRepository(dynamoClient);
  return {
    findSongById: songsRepository.getSongById,
    allowedOrigins,
    getTagsByName: tagsRepository.getTagsByName,
    findSongsByTagId: songsRepository.findSongsByTag,
    findSongsWithVotes: songsRepository.findSongsWithVotes,
    incrementSongVotes: songsRepository.addVoteToSong,
  };
};

export const getSong = createGetSongLambda(getAppDependencies());

export const getTags = createGetTagsByNameLambda(getAppDependencies());

export const getSongsByTagId = createGetSongsByTagIdLambda(
  getAppDependencies()
);

export const getPlaylist = createGetPlaylist(getAppDependencies());
export const voteForSong = createVoteForSongLambda(getAppDependencies());
