import { describe, it } from "@jest/globals";
import { afterEach } from "node:test";
import { Dynamo, startDynamo } from "./testutils";
import { createVoucherRepository } from "./voucher-repository";
import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { StatusCodes } from "../util/statusCodes";

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

  it("subtracts from voucher value", async () => {
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
    const subtractResult = await voucherRepository.subtractValue(
      voucherCode,
      2
    );
    expect(subtractResult).toEqual(StatusCodes.Ok);
    const loadedVoucher = await voucherRepository.getVoucherByCode(voucherCode);
    expect(loadedVoucher).toBeDefined();
    expect(loadedVoucher).toMatchObject({
      code: voucherCode,
      value: voucherValue - 2,
    });
  });

  it("refuses to subtract when balance is insufficient", async () => {
    const voucherCode = "ABCDEFG";
    const voucherValue = 5;

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
    const subtractResult = await voucherRepository.subtractValue(
      voucherCode,
      20
    );
    expect(subtractResult).toEqual(StatusCodes.INSUFFICIENT_FUNDS);
    const loadedVoucher = await voucherRepository.getVoucherByCode(voucherCode);
    expect(loadedVoucher).toBeDefined();
    expect(loadedVoucher).toMatchObject({
      code: voucherCode,
      value: voucherValue,
    });
  });

  it("refuses to subtract from non-existent voucher", async () => {
    const voucherCode = "NO_VOUCHER";

    const voucherRepository = createVoucherRepository(dynamo.client());
    const subtractResult = await voucherRepository.subtractValue(
      voucherCode,
      20
    );
    expect(subtractResult).toEqual(StatusCodes.UNKNOWN_VOUCHER);
  });
});
