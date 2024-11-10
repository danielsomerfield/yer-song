import { describe, it } from "@jest/globals";
import { User } from "../domain/user";
import * as AddVoteToSong from "./voteForSong";
import { SongRequestInput, VoteModes } from "./voteForSong";
import { APIGatewayProxyEvent } from "aws-lambda";
import { verifyCORSHeaders } from "../http/headers.testing";
import resetAllMocks = jest.resetAllMocks;
import MockedFunction = jest.MockedFunction;
import fn = jest.fn;
import { StatusCodes } from "../util/statusCodes";

describe("Paying by voucher", () => {
  const songId = "s:123123";
  const origin = "https://www.example.com";
  const voter: User = {
    id: "u:voter1",
    name: "Voter 1",
  };

  it("accepts payment from a valid voucher with sufficient value", async () => {
    const insertSongRequest: MockedFunction<
      (vote: SongRequestInput) => Promise<{ requestId: string }>
    > = fn();

    insertSongRequest.mockResolvedValue({ requestId: "" });

    const dependencies = {
      insertVote: fn(), // TODO: this shouldn't really be a dependency
      insertSongRequest,
      allowedOrigins: new Set([origin]),
      getIdentityFromRequest: () => voter,
      voteMode: () => VoteModes.DOLLAR_VOTE,
      verifyVoucher: () => StatusCodes.Ok,
    };

    const event = {
      pathParameters: { songId },
      body: JSON.stringify({
        value: 10,
        voucher: "ABCDEFG",
      }),
      headers: {
        origin,
      },
    } as unknown as APIGatewayProxyEvent;

    const voteForSong = AddVoteToSong.createVoteForSongLambda(dependencies);
    const result = await voteForSong(event);

    const expectedSongRequest = {
      songId,
      voter,
      value: 10,
      voucher: "ABCDEFG",
    };

    expect(insertSongRequest.mock.calls.length).toEqual(1);
    expect(insertSongRequest.mock.calls[0][0]).toMatchObject(
      expectedSongRequest
    );
    expect(result.statusCode).toEqual(200);
    expect(JSON.parse(result.body)).toMatchObject({
      status: "OK",
    });

    verifyCORSHeaders(result, origin);
  });

  it("refuses payment from an invalid voucher", async () => {
    const insertSongRequest: MockedFunction<
      (vote: SongRequestInput) => Promise<{ requestId: string }>
    > = fn();

    const dependencies = {
      insertVote: fn(), // TODO: this shouldn't really be a dependency
      insertSongRequest,
      allowedOrigins: new Set([origin]),
      getIdentityFromRequest: () => voter,
      voteMode: () => VoteModes.DOLLAR_VOTE,
      verifyVoucher: () => StatusCodes.UNKNOWN_VOUCHER,
    };

    const event = {
      pathParameters: { songId },
      body: JSON.stringify({
        value: 10,
        voucher: "ABCDEFG",
      }),
      headers: {
        origin,
      },
    } as unknown as APIGatewayProxyEvent;

    const voteForSong = AddVoteToSong.createVoteForSongLambda(dependencies);
    const result = await voteForSong(event);

    const expectedSongRequest = {
      songId,
      voter,
      value: 10,
      voucher: "ABCDEFG",
    };

    expect(insertSongRequest.mock.calls.length).toEqual(0);
    expect(result.statusCode).toEqual(422);
    expect(JSON.parse(result.body)).toMatchObject({
      status: "UnknownVoucher",
    });

    verifyCORSHeaders(result, origin);
  });

  beforeEach(() => {
    resetAllMocks();
  });
});
