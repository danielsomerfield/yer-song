import { describe, it } from "@jest/globals";
import { User } from "../domain/user";
import { APIGatewayProxyEvent } from "aws-lambda";
import { verifyCORSHeaders } from "../http/headers.testing";
import { SongRequestInput } from "./domain";
import { createDollarVoteModeLambda } from "./dollarVoteLambda";
import resetAllMocks = jest.resetAllMocks;
import MockedFunction = jest.MockedFunction;
import fn = jest.fn;
import { StatusCode, StatusCodes } from "../util/statusCodes";

describe("Paying by voucher", () => {
  const songId = "s:123123";
  const origin = "https://www.example.com";
  const voter: User = {
    id: "u:voter1",
    name: "Voter 1",
  };

  it("accepts payment from a valid voucher with sufficient value", async () => {
    const requestSong: MockedFunction<
      (
        vote: SongRequestInput
      ) => Promise<{ requestId: string; status: StatusCode; details: string }>
    > = fn();

    requestSong.mockResolvedValue({ requestId: "", status: "OK", details: "" });

    const dependencies = {
      requestSong,
      allowedOrigins: new Set([origin]),
      getIdentityFromRequest: () => voter,
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

    const voteForSong = createDollarVoteModeLambda(dependencies);
    const result = await voteForSong(event);

    const expectedSongRequest = {
      songId,
      voter,
      value: 10,
      voucher: "ABCDEFG",
    };

    expect(requestSong.mock.calls.length).toEqual(1);
    expect(requestSong.mock.calls[0][0]).toMatchObject(expectedSongRequest);
    expect(result.statusCode).toEqual(200);
    expect(JSON.parse(result.body).data).toMatchObject({
      status: "OK",
    });

    verifyCORSHeaders(result, origin);
  });

  it("refuses payment from an invalid voucher", async () => {
    const requestSong: MockedFunction<
      (
        vote: SongRequestInput
      ) => Promise<{ requestId: string; status: StatusCode; details: string }>
    > = fn();

    requestSong.mockResolvedValue({
      requestId: "",
      status: StatusCodes.UNKNOWN_VOUCHER,
      details: "",
    });

    const dependencies = {
      requestSong,
      allowedOrigins: new Set([origin]),
      getIdentityFromRequest: () => voter,
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

    const voteForSong = createDollarVoteModeLambda(dependencies);
    const result = await voteForSong(event);

    expect(requestSong.mock.calls.length).toEqual(1);
    expect(result.statusCode).toEqual(422);
    expect(JSON.parse(result.body).data).toMatchObject({
      status: "UnknownVoucher",
    });

    verifyCORSHeaders(result, origin);
  });

  beforeEach(() => {
    resetAllMocks();
  });
});
