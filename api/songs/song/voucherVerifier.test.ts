import { createVoucherVerifier } from "./voucherVerifier";
import { Voucher } from "../domain/voucher";
import { Maybe } from "../util/maybe";
import { describe, it } from "@jest/globals";
import MockedFunction = jest.MockedFunction;
import fn = jest.fn;
import { StatusCodes } from "../util/statusCodes";
import { User } from "../domain/user";

describe("the voucher verifier", () => {
  it("accepts known vouchers with sufficient funds", async () => {
    const getVoucherByCode: MockedFunction<
      (code: string) => Promise<Maybe<Voucher>>
    > = fn();

    getVoucherByCode.mockResolvedValue({ value: 5, code: "abced'" });

    const dependencies = {
      getVoucherByCode,
    };
    const voucherVerifier = createVoucherVerifier(dependencies);
    const result = await voucherVerifier({
      voucherCode: "abcd",
      value: 2,
      voter: {} as User,
      songId: "fdas",
    });
    expect(result).toEqual(StatusCodes.Ok);
  });

  it("denies unknown vouchers", async () => {
    const getVoucherByCode: MockedFunction<
      (code: string) => Promise<Maybe<Voucher>>
    > = fn();

    getVoucherByCode.mockResolvedValue(undefined);

    const dependencies = {
      getVoucherByCode,
    };
    const voucherVerifier = createVoucherVerifier(dependencies);
    const result = await voucherVerifier({
      voucherCode: "abcd",
      value: 2,
      voter: {} as User,
      songId: "fdas",
    });
    expect(result).toEqual(StatusCodes.UNKNOWN_VOUCHER);
  });

  it("denies vouchers with less credit than requested", async () => {
    const getVoucherByCode: MockedFunction<
      (code: string) => Promise<Maybe<Voucher>>
    > = fn();

    getVoucherByCode.mockResolvedValue({ value: 5, code: "abced'" });

    const dependencies = {
      getVoucherByCode,
    };
    const voucherVerifier = createVoucherVerifier(dependencies);
    const result = await voucherVerifier({
      voucherCode: "abcd",
      value: 20,
      voter: {} as User,
      songId: "fdas",
    });
    expect(result).toEqual(StatusCodes.INSUFFICIENT_FUNDS);
  });
});
