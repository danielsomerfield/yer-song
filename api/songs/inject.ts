import { createSongRepository } from "./respository/song-repository";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { DynamoDBClientConfig } from "@aws-sdk/client-dynamodb/dist-types/DynamoDBClient";
import { createTagsRepository } from "./respository/tag-repository";
import { createUserRepository } from "./respository/user-repository";
import { AuthConfiguration, createAuthorization } from "./authz/authorization";
import {
  createGenerateToken,
  createGetIdentityFromRequest,
} from "./authz/token";
import { createValidateAdminUser } from "./admin/validate";
import { VoteModes } from "./song/voteForSong";
import { createSongRequestRepository } from "./respository/song-request-repository";

const getDynamoEndpoint = () => {
  const endpoint = process.env.API_ENDPOINT;
  return endpoint == undefined || endpoint.trim().length == 0
    ? undefined
    : endpoint;
};

const dynamoDBConfiguration: DynamoDBClientConfig = {
  endpoint: getDynamoEndpoint(),
};

interface Configuration {
  dynamodb: DynamoDBClientConfig;
  allowOrigin: string;
  authorization: {
    secret: string;
  };
}

const defaultConfiguration: () => Configuration = () => {
  const getSecret = () => {
    const secret = process.env["AUTHZ_SECRET"];
    if (!secret) {
      throw "The AUTHZ_SECRET envvar must be configured";
    }
    return secret;
  };

  return {
    dynamodb: dynamoDBConfiguration,
    allowOrigin: process.env["ALLOW_ORIGIN"] || "http://localhost:3001",
    authorization: {
      secret: getSecret(),
    },
  };
};

export const getAppDependencies = (
  configuration: Configuration = defaultConfiguration()
) => {
  const getAuthConfiguration = (): AuthConfiguration => {
    if (!configuration.authorization.secret) {
      throw new Error("Missing the authorization secret");
    } else {
      return { secret: configuration.authorization.secret };
    }
  };
  const createDynamoClient = () => new DynamoDB(configuration.dynamodb);

  const dynamoClient: DynamoDB = createDynamoClient();

  const allowedOrigins = new Set(configuration.allowOrigin.split(","));
  const tagsRepository = createTagsRepository(dynamoClient);
  const songsRepository = createSongRepository(dynamoClient);
  const userRepository = createUserRepository(dynamoClient);
  const songRequestRepository = createSongRequestRepository(dynamoClient);

  const getIdentityFromRequest = createGetIdentityFromRequest(
    configuration.authorization.secret
  );

  const generateToken = createGenerateToken({
    secret: configuration.authorization.secret,
  });

  const validateCredentials = createValidateAdminUser({
    findUserByName: userRepository.findUserByName,
  });

  return {
    findSongById: songsRepository.getSongById,
    allowedOrigins,
    getTagsByName: tagsRepository.getTagsByName,
    findSongsByTagId: songsRepository.findSongsByTag,
    findSongsWithVotes: songsRepository.findSongsWithVotes,
    insertVote: songsRepository.addVoteToSong,
    insertUser: userRepository.insertUser,
    authRules: createAuthorization({ allowedOrigins }, getAuthConfiguration()),
    generateToken: generateToken,
    getIdentityFromRequest,
    clearVotes: songsRepository.clearVotes,
    validateCredentials,
    // TODO: make this configurable
    voteMode: () => VoteModes.DOLLAR_VOTE,
    insertSongRequest: songRequestRepository.addSongRequest,
    findAllSongRequests: songRequestRepository.findAllSongRequests,
    insertLock: songsRepository.addLockToSong,
    approveRequest: songRequestRepository.approveSongRequest,
  };
};
