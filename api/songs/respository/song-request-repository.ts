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
import { Approval } from "../admin/approveSongRequest";

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
    // const requestsToAdd: Record<string, AttributeValue> = {};
    const requestToAdd = {
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
    };

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
          M: requestToAdd,
        },
        ":status": {
          S: RequestStatuses.PENDING_APPROVAL,
        },
        ":voter": {
          L: [
            {
              M: {
                id: {
                  S: voter.id,
                },
                name: {
                  S: voter.name,
                },
              },
            },
          ],
        },
        ":empty": {
          L: [],
        },
      },

      UpdateExpression:
        "SET requests.#id = :request, GSI2PK = if_not_exists(GSI2PK, :status), voters = list_append(if_not_exists(voters, :empty), :voter)",
      ExpressionAttributeNames: {
        "#id": requestId,
      },
    });

    return {
      requestId,
    };
  };

  // TODO: turns out that putting song requests under songs was not the best choice.
  //  For now, we'll just make sure that the requests field exist for all songs, even if it's empty,
  //  but ultimately, we'd be much better off peeling out the requests entity into the Single Table
  //  pattern and taking the rather small cost of another index, if necessary.
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
            "status",
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
        const maybeRequestRecords = Object.entries(i["requests"]?.M || {});
        return maybeRequestRecords
          .map((r) =>
            r[1].M != undefined
              ? createSongRequestFromRecord(
                  getRequiredString(i, "PK"),
                  getRequiredString(i, "title"),
                  r[1].M
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

  const approveSongRequest = async (approval: Approval): Promise<void> => {
    // TODO: this should be refactored with song-repository's `addVoteToSong`. As things stand, they are highly
    //  duplicative and, by definition, do the same thing.
    await client.transactWriteItems({
      TransactItems: [
        {
          Update: {
            TableName: "song",
            Key: {
              PK: {
                S: approval.songId,
              },
              SK: {
                S: approval.songId,
              },
            },
            ExpressionAttributeValues: {
              ":requestStatus": {
                S: RequestStatuses.APPROVED,
              },
              ":playlist": {
                S: "ON_PLAYLIST",
              },
              ":increment": {
                N: approval.value.toString(),
              },
              ":zero": {
                N: "0",
              },
              ":ts": {
                S: DateTime.now().toUTC().toISO({ suppressMilliseconds: true }),
              },
            },

            UpdateExpression:
              "SET requests.#id.#status = :requestStatus, GSI2PK = :playlist, voteCount = if_not_exists(voteCount, :zero) + :increment, submitTime = if_not_exists(submitTime, :ts)",
            ExpressionAttributeNames: {
              "#id": approval.requestId,
              "#status": "status",
            },
          },
        },
      ],
    });
  };

  return {
    addSongRequest,
    findAllSongRequests,
    approveSongRequest,
  };
};
