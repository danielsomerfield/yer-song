import {
  AttributeValue,
  DynamoDB,
  TransactWriteItem,
} from "@aws-sdk/client-dynamodb";
import { Voucher } from "../domain/voucher";

const tableName = "song";

export const createVoucherRepository = (client: DynamoDB) => {
  const getVoucherByCode = async () => {
    throw "NYI";
  };

  const updateVoucher = async (voucher: Voucher) => {
    const userRecord: Record<string, AttributeValue> = {
      PK: { S: `v:${voucher.code}` },
      SK: { S: `v:${voucher.code}` },
      entityType: { S: "voucher" },
      value: { N: voucher.value.toString() },
    };

    await client.putItem({
      TableName: tableName,
      Item: userRecord,
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
