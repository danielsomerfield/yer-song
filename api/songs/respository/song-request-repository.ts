import { SongRequest } from "../song/voteForSong";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { DateTime } from "luxon";

export const createSongRequestRepository = (
  client: DynamoDB,
  idGen: () => string = () =>
    `${DateTime.now().toUTC().toFormat("yLLddHHmmss")}${Math.floor(
      Math.random() * 100_000_000
    )}`,
  nowProvider: () => DateTime = DateTime.now
) => {
  const addSongRequest = async (
    request: SongRequest
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
                requestStatus: {
                  S: "PENDING_APPROVAL",
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
          S: "PENDING_APPROVAL",
        },
      },

      UpdateExpression:
        "SET requests = list_append(if_not_exists(requests, :empty), :request), GSI2PK = if_not_exists(GSI2PK, :status)",
    });

    return {
      requestId,
    };
  };

  return {
    addSongRequest,
  };
};
