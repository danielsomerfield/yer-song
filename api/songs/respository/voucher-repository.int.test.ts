import { describe, it } from "@jest/globals";
import { afterEach } from "node:test";
import { Dynamo, startDynamo } from "./testutils";
import { createUserRepository } from "./user-repository";
import { User } from "../domain/user";
import * as bcrypt from "bcryptjs";
import { createVoucherRepository } from "./voucher-repository";

describe("The voucher repository", () => {
  let dynamo: Dynamo;

  beforeEach(async () => {
    dynamo = await startDynamo();
  }, 60 * 1000);

  afterEach(async () => {
    await dynamo.stop();
  });

  it("saves vounchers in the db", async () => {
    const voucher_1_code = "ABCDEFG";
    const voucher_2_code = "12345TA";

    const voucherRepository = createVoucherRepository(dynamo.client());
    await voucherRepository.addVouchers([voucher_1_code, voucher_2_code], 12);

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

    const savedVoucher1 = await load_voucher_by_code(voucher_1_code);

    expect(savedVoucher1.Item).toBeDefined();
    expect(savedVoucher1.Item).toMatchObject({
      PK: {
        S: `v:${voucher_1_code}`,
      },
      SK: {
        S: `v:${voucher_1_code}`,
      },
      value: { N: "12" },
      entityType: { S: "voucher" },
    });

    const savedVoucher2 = await load_voucher_by_code(voucher_2_code);

    expect(savedVoucher2.Item).toBeDefined();
    expect(savedVoucher2.Item).toMatchObject({
      PK: {
        S: `v:${voucher_2_code}`,
      },
      SK: {
        S: `v:${voucher_2_code}`,
      },
      value: { N: "12" },
      entityType: { S: "voucher" },
    });
  });
});
