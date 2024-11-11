import { StatusCode, StatusCodes } from "../util/statusCodes";
import { SongRequestInput, Vote } from "./domain";
import { createHash } from "node:crypto";
import { User } from "../domain/user";

interface RequestSongResponse {
  requestId: string;
  status: StatusCode;
}

export interface RequestSongInput {
  requestId: string;
  voter: User;
  songId: string;
  value: number;
}

const idGenerator = () =>
  createHash("shake256", { outputLength: 6 })
    .update(Math.random().toString())
    .digest("hex");

interface Dependencies {
  addVoteToSong: (vote: Vote, increment: number) => Promise<void>;
  subtractFromVoucher: (
    code: string,
    valueToSubtract: number
  ) => Promise<StatusCode>;
  queueSongRequest: (request: RequestSongInput) => Promise<StatusCode>;
}

async function processVoucher(
  subtractFromVoucher: (
    code: string,
    valueToSubtract: number
  ) => Promise<StatusCode>,
  voucher: string,
  voucherValue: number,
  addVoteToSong: (vote: Vote, increment: number) => Promise<void>,
  request: SongRequestInput
) {
  const debitStatus = await subtractFromVoucher(voucher, voucherValue);
  if (debitStatus == StatusCodes.Ok) {
    await addVoteToSong(
      { songId: request.songId, voter: request.voter },
      voucherValue
    );
  }
  return debitStatus;
}

export const createRequestSong = (
  dependencies: Dependencies,
  idGen: () => string = idGenerator
) => {
  return async (request: SongRequestInput): Promise<RequestSongResponse> => {
    const { subtractFromVoucher, addVoteToSong, queueSongRequest } =
      dependencies;
    const voucher = request.voucher;
    if (voucher) {
      const status = await processVoucher(
        subtractFromVoucher,
        voucher,
        request.value,
        addVoteToSong,
        request
      );
      return { status, requestId: idGen() };
    } else {
      const status = await queueSongRequest({ requestId: idGen(), ...request });
      return { status, requestId: idGen() };
    }
  };
};
