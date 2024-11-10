import {
  AttributeValue,
  ConditionalCheckFailedException,
  DynamoDB,
  TransactWriteItem,
} from "@aws-sdk/client-dynamodb";
import { Voucher } from "../domain/voucher";
import { Maybe } from "../util/maybe";
import { StatusCode, StatusCodes } from "../util/statusCodes";

const tableName = "song";

export const createVoucherRepository = (client: DynamoDB) => {
  const getVoucherByCode = async (code: string): Promise<Maybe<Voucher>> => {
    const record = await client.getItem({
      TableName: "song",
      Key: {
        PK: {
          S: `v:${code}`,
        },
        SK: {
          S: `v:${code}`,
        },
      },
    });
    // TODO: better error handling for bad data
    const idString = record.Item?.PK.S;
    return record.Item && idString
      ? {
          code: idString.substring(2),
          value: Number.parseInt(record.Item.value.N || "0"),
        }
      : undefined;
  };

  const subtractValue = async (
    code: string,
    valueToSubtract: number
  ): Promise<StatusCode> => {
    try {
      await client.updateItem({
        TableName: tableName,
        Key: {
          PK: { S: `v:${code}` },
          SK: { S: `v:${code}` },
        },
        ExpressionAttributeNames: {
          "#valueField": "value",
        },
        ExpressionAttributeValues: {
          ":valueToSubtract": {
            N: valueToSubtract.toString(),
          },
        },
        ConditionExpression: "#valueField >= :valueToSubtract",
        UpdateExpression: `set #valueField = #valueField - :valueToSubtract`,
        ReturnValuesOnConditionCheckFailure: "ALL_OLD",
      });
    } catch (e) {
      if (e instanceof ConditionalCheckFailedException) {
        if (e.Item) {
          return StatusCodes.INSUFFICIENT_FUNDS;
        } else {
          return StatusCodes.UNKNOWN_VOUCHER;
        }
      }
      return StatusCodes.UNEXPECTED_ERROR;
    }

    return StatusCodes.Ok;
  };

  return {
    addVouchers: async (voucherCodes: string[], value: number) => {
      const items: TransactWriteItem[] = voucherCodes.map((code) => {
        return {
          Put: {
            TableName: tableName,
            Item: {
              PK: { S: `v:${code}` },
              SK: { S: `v:${code}` },
              entityType: { S: "voucher" },
              value: { N: value.toString() },
            },
          },
        };
      });
      await client.transactWriteItems({
        TransactItems: items,
      });
    },
    getVoucherByCode,
    subtractValue,
  };
};
