import { describe, expect } from "@jest/globals";
import { createRequestSong } from "./requestSong";
import { SongRequestInput, Vote } from "./domain";
import { StatusCode, StatusCodes } from "../util/statusCodes";
import MockedFunction = jest.MockedFunction;
import fn = jest.fn;
import resetAllMocks = jest.resetAllMocks;

describe("song request", () => {
  const voucherCode = "CDFF4D";
  const voucher = `v:${voucherCode}`;
  const songId = "s:123123";
  const voterId = "u:123";

  const addVoteToSong: MockedFunction<
    (vote: Vote, increment: number) => Promise<void>
  > = fn();
  const subtractFromVoucher: MockedFunction<
    (
      code: string,
      valueToSubtract: number
    ) => Promise<{ status: StatusCode; details: string }>
  > = fn();

  const queueSongRequest: MockedFunction<
    (request: SongRequestInput) => Promise<StatusCode>
  > = fn();

  const dependencies = {
    addVoteToSong,
    subtractFromVoucher,
    queueSongRequest,
    idGen: () => "123123123",
  };

  it("adds vote when voucher is accepted", async () => {
    subtractFromVoucher.mockResolvedValueOnce({
      status: StatusCodes.Ok,
      details: "",
    });
    const requestSong = createRequestSong(dependencies);

    const voucher = voucherCode;
    const input: SongRequestInput = {
      songId,
      value: 5,
      voter: {
        id: voterId,
        name: "u123",
      },
      voucher,
    };

    const response = await requestSong(input);
    expect(response.status).toEqual(StatusCodes.Ok);
    expect(subtractFromVoucher).toHaveBeenCalledWith(voucherCode, 5);
    expect(addVoteToSong).toHaveBeenCalledWith(
      expect.objectContaining({
        voter: expect.objectContaining({ id: voterId }),
        songId,
      }),
      5
    );
  });

  it("refuses an invalid voucher", async () => {
    const requestSong = createRequestSong(dependencies);
    subtractFromVoucher.mockResolvedValueOnce({
      status: StatusCodes.UNKNOWN_VOUCHER,
      details: "",
    });

    const input: SongRequestInput = {
      songId,
      value: 5,
      voter: {
        id: voterId,
        name: "u123",
      },
      voucher: "NONE",
    };

    const response = await requestSong(input);
    expect(response.status).toEqual(StatusCodes.UNKNOWN_VOUCHER);
    expect(subtractFromVoucher).toHaveBeenCalledWith("NONE", 5);
    expect(addVoteToSong).not.toHaveBeenCalled();
  });

  it("refuses a voucher with insufficient funds", async () => {
    const requestSong = createRequestSong(dependencies);
    subtractFromVoucher.mockResolvedValueOnce({
      status: StatusCodes.INVALID_INPUT,
      details: "",
    });

    const input: SongRequestInput = {
      songId,
      value: 5,
      voter: {
        id: voterId,
        name: "u123",
      },
      voucher: voucherCode,
    };

    const response = await requestSong(input);
    expect(response.status).toEqual(StatusCodes.INVALID_INPUT);
    expect(subtractFromVoucher).toHaveBeenCalledWith(voucherCode, 5);
    expect(addVoteToSong).not.toHaveBeenCalled();
  });

  it("adds a song request if there is no voucher", async () => {
    const requestSong = createRequestSong(dependencies);
    queueSongRequest.mockResolvedValueOnce("OK");

    const input: SongRequestInput = {
      songId,
      value: 5,
      voter: {
        id: voterId,
        name: "u123",
      },
    };

    const response = await requestSong(input);
    expect(response.status).toEqual(StatusCodes.Ok);
    expect(queueSongRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        songId,
        value: 5,
        voter: expect.objectContaining({
          id: voterId,
        }),
      })
    );

    expect(subtractFromVoucher).not.toHaveBeenCalled();
    expect(addVoteToSong).not.toHaveBeenCalled();
  });

  it("is case insensitive", async () => {
    subtractFromVoucher.mockResolvedValueOnce({
      status: StatusCodes.Ok,
      details: "",
    });
    const requestSong = createRequestSong(dependencies);

    const voucher = "abc123";
    const input: SongRequestInput = {
      songId,
      value: 5,
      voter: {
        id: voterId,
        name: "u123",
      },
      voucher,
    };

    const response = await requestSong(input);
    expect(response.status).toEqual(StatusCodes.Ok);
    expect(subtractFromVoucher).toHaveBeenCalledWith("ABC123", 5);
  });

  beforeEach(() => {
    resetAllMocks();
  });
});
