import {
  AttributeValue,
  DynamoDB,
  TransactWriteItem,
} from "@aws-sdk/client-dynamodb";
import { Voucher } from "../domain/voucher";
import { Maybe } from "../util/maybe";

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

  const updateVoucher = async (voucher: Voucher) => {
    const voucherRecord: Record<string, AttributeValue> = {
      PK: { S: `v:${voucher.code}` },
      SK: { S: `v:${voucher.code}` },
      entityType: { S: "voucher" },
      value: { N: voucher.value.toString() },
    };

    await client.putItem({
      TableName: tableName,
      Item: voucherRecord,
    });
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
  };
};
