import { StatusCode, StatusCodes } from "../util/statusCodes";
import { SongRequestInput, Vote } from "./domain";

interface RequestSongResponse {
  status: StatusCode;
}

interface Dependencies {
  addVoteToSong: (vote: Vote, increment: number) => Promise<void>;
  subtractFromVoucher: (
    code: string,
    valueToSubtract: number
  ) => Promise<StatusCode>;
  queueSongRequest: (
    request: SongRequestInput
  ) => Promise<{ requestId: string; status: StatusCode }>;
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
  return { status: debitStatus };
}

export const createRequestSong = (dependencies: Dependencies) => {
  return async (request: SongRequestInput): Promise<RequestSongResponse> => {
    const { subtractFromVoucher, addVoteToSong, queueSongRequest } =
      dependencies;
    const voucher = request.voucher;
    if (voucher) {
      return await processVoucher(
        subtractFromVoucher,
        voucher,
        request.value,
        addVoteToSong,
        request
      );
    } else {
      return await queueSongRequest(request);
    }
  };
};
