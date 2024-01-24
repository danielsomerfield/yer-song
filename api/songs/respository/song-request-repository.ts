import {
  AttributeValue,
  DynamoDB,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { DateTime } from "luxon";
import { Paginated } from "../domain/songs";
import {
  getRequiredInt,
  getRequiredString,
  getStringOrDefault,
} from "./repository";
import { logger } from "../util/logger";
import { SongRequestInput } from "../song/voteForSong";
import {
  RequestStatus,
  RequestStatuses,
  SongRequest,
} from "../admin/songRequests";
import { Maybe } from "../util/maybe";
import { createHash } from "node:crypto";

const idGenerator = () =>
  createHash("shake256", { outputLength: 6 })
    .update(Math.random().toString())
    .digest("hex");

export const createSongRequestRepository = (
  client: DynamoDB,
  idGen: () => string = idGenerator,
  nowProvider: () => DateTime = DateTime.now
) => {
  const addSongRequest = async (
    request: SongRequestInput
  ): Promise<{ requestId: string }> => {
    const { songId, voter, value } = request;
    const nowString = nowProvider()
      .toUTC()
      .toISO({ suppressMilliseconds: true });
    if (!nowString) {
      throw new Error("Invalid timestamp. This is almost certainly a bug");
    }
    const requestId = idGen();
    await client.updateItem({
      TableName: "song",
      Key: {
        PK: {
          S: songId,
        },
        SK: {
          S: songId,
        },
      },
      ReturnValues: "UPDATED_NEW",
      ExpressionAttributeValues: {
        ":request": {
          L: [
            {
              M: {
                id: {
                  S: requestId,
                },
                voterId: {
                  S: voter.id,
                },
                voterName: {
                  S: voter.name,
                },
                status: {
                  S: RequestStatuses.PENDING_APPROVAL,
                },
                value: {
                  N: value.toString(),
                },
                timestamp: {
                  S: nowString,
                },
              },
            },
          ],
        },
        ":empty": {
          L: [],
        },
        ":status": {
          S: RequestStatuses.PENDING_APPROVAL,
        },
      },

      UpdateExpression:
        "SET requests = list_append(if_not_exists(requests, :empty), :request), GSI2PK = if_not_exists(GSI2PK, :status)",
    });

    return {
      requestId,
    };
  };

  const findAllSongRequests = async (): Promise<Paginated<SongRequest>> => {
    const createSongRequestFromRecord = (
      songId: string,
      songTitle: string,
      item: Record<string, AttributeValue>
    ): Maybe<SongRequest> => {
      try {
        return {
          id: getRequiredString(item, "id"),
          status: getStringOrDefault(
            item,
            "requestStatus",
            RequestStatuses.PENDING_APPROVAL
          ) as RequestStatus,
          requestedBy: {
            id: getRequiredString(item, "voterId"),
            name: getRequiredString(item, "voterName"),
          },
          song: {
            id: songId,
            title: songTitle,
          },
          value: getRequiredInt(item, "value"),
          timestamp: DateTime.fromISO(
            getRequiredString(item, "timestamp")
          ).toUTC(),
        };
      } catch (e) {
        logger.warn(`Filtering out bad record with id '${item["id"]}'`);
        return undefined;
      }
    };

    // TODO: at this point, we need to make two requests because GSI2PK is a key for this index and we can't do an `IN` or `OR`,
    //  This works for now, but we might want to find a better way to index that will be cheaper and only require one request.
    const songsOnPlaylist = client.send(
      new QueryCommand({
        TableName: "song",
        IndexName: "GSI2",
        KeyConditionExpression: "GSI2PK = :pk",
        ExpressionAttributeValues: {
          ":pk": {
            S: "ON_PLAYLIST",
          },
        },
      })
    );

    const songsPendingApproval = client.send(
      new QueryCommand({
        TableName: "song",
        IndexName: "GSI2",
        KeyConditionExpression: "GSI2PK = :pk",
        ExpressionAttributeValues: {
          ":pk": {
            S: RequestStatuses.PENDING_APPROVAL,
          },
        },
      })
    );

    const union = await Promise.all([songsOnPlaylist, songsPendingApproval]);
    const filteredItems = union
      .flatMap((i) => i.Items)
      .filter((i) => i != undefined) as Record<string, AttributeValue>[];

    const maybeRequests: SongRequest[] =
      filteredItems.flatMap((i) => {
        const maybeRequestRecords = i["requests"]?.L || [];
        return maybeRequestRecords
          .map((r) =>
            r.M != undefined
              ? createSongRequestFromRecord(
                  getRequiredString(i, "PK"),
                  getRequiredString(i, "title"),
                  r.M
                )
              : undefined
          )
          .filter((r) => r != undefined) as SongRequest[];
      }) || [];

    return {
      page: maybeRequests,
      thisPage: "",
    };
  };

  return {
    addSongRequest,
    findAllSongRequests,
  };
};
