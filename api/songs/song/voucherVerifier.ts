import { Maybe } from "../util/maybe";
import { Voucher } from "../domain/voucher";
import { StatusCodes } from "../util/statusCodes";
import { User } from "../domain/user";

interface SongRequestWithVoucher {
  songId: string;
  voter: User;
  value: number;
  voucherCode: string;
}

interface Dependencies {
  getVoucherByCode: (code: string) => Promise<Maybe<Voucher>>;
}

export const createVoucherVerifier = (dependencies: Dependencies) => {
  const { getVoucherByCode } = dependencies;
  return async (request: SongRequestWithVoucher) => {
    const maybeVoucher = await getVoucherByCode(request.voucherCode);
    return maybeVoucher ? StatusCodes.Ok : StatusCodes.UNKNOWN_VOUCHER;
  };
};
