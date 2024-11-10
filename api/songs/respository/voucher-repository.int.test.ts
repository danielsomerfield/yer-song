import { describe, it } from "@jest/globals";
import { afterEach } from "node:test";
import { Dynamo, startDynamo } from "./testutils";
import { createUserRepository } from "./user-repository";
import { User } from "../domain/user";
import * as bcrypt from "bcryptjs";
import { createVoucherRepository } from "./voucher-repository";
import { AttributeValue } from "@aws-sdk/client-dynamodb";

describe("The voucher repository", () => {
  let dynamo: Dynamo;

  beforeEach(async () => {
    dynamo = await startDynamo();
  }, 60 * 1000);

  afterEach(async () => {
    await dynamo.stop();
  });

  it("saves vounchers in the db", async () => {
    const voucher1Code = "ABCDEFG";
    const voucher2Code = "12345TA";

    const voucherRepository = createVoucherRepository(dynamo.client());
    await voucherRepository.addVouchers([voucher1Code, voucher2Code], 12);

    async function load_voucher_by_code(code: string) {
      return await dynamo.client().getItem({
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
    }

    const savedVoucher1 = await load_voucher_by_code(voucher1Code);

    expect(savedVoucher1.Item).toBeDefined();
    expect(savedVoucher1.Item).toMatchObject({
      PK: {
        S: `v:${voucher1Code}`,
      },
      SK: {
        S: `v:${voucher1Code}`,
      },
      value: { N: "12" },
      entityType: { S: "voucher" },
    });

    const savedVoucher2 = await load_voucher_by_code(voucher2Code);

    expect(savedVoucher2.Item).toBeDefined();
    expect(savedVoucher2.Item).toMatchObject({
      PK: {
        S: `v:${voucher2Code}`,
      },
      SK: {
        S: `v:${voucher2Code}`,
      },
      value: { N: "12" },
      entityType: { S: "voucher" },
    });
  });

  it("fetches vouchers by code", async () => {
    const voucherCode = "ABCDEFG";
    const voucherValue = 123;

    const voucherRecord: Record<string, AttributeValue> = {
      PK: { S: `v:${voucherCode}` },
      SK: { S: `v:${voucherCode}` },
      entityType: { S: "voucher" },
      value: { N: voucherValue.toString() },
    };

    await dynamo.client().putItem({
      TableName: "song",
      Item: voucherRecord,
    });

    const voucherRepository = createVoucherRepository(dynamo.client());
    const loadedVoucher = await voucherRepository.getVoucherByCode(voucherCode);
    expect(loadedVoucher).toBeDefined();
    expect(loadedVoucher).toMatchObject({
      code: voucherCode,
      value: voucherValue,
    });
  });
});
