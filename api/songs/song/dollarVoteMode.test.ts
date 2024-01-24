import { describe, it } from "@jest/globals";
import { User } from "../domain/user";
import * as AddVoteToSong from "./voteForSong";
import { SongRequestInput, VoteModes } from "./voteForSong";
import { APIGatewayProxyEvent } from "aws-lambda";
import { verifyCORSHeaders } from "../http/headers.testing";
import { StatusCodes } from "../util/statusCodes";
import resetAllMocks = jest.resetAllMocks;
import MockedFunction = jest.MockedFunction;
import fn = jest.fn;

describe("dollar vote mode", () => {
  const songId = "s:123123";
  const origin = "https://www.example.com";
  const voter: User = {
    id: "u:voter1",
    name: "Voter 1",
  };

  beforeEach(() => {
    resetAllMocks();
  });

  it("accepts multiple vote units from a registered user", async () => {
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
    };

    const event = {
      pathParameters: { songId },
      body: JSON.stringify({
        value: 10,
      }),
      headers: {
        origin,
      },
    } as unknown as APIGatewayProxyEvent;

    const voteForSong = AddVoteToSong.createVoteForSongLambda(dependencies);
    const result = await voteForSong(event);
    const expectedSongRequest: SongRequestInput = {
      songId,
      voter,
      value: 10,
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

  it("rejects request without body", async () => {
    await testExpectedResponseCodeForBody(undefined, 400, {
      status: StatusCodes.INVALID_INPUT,
    });
  });

  it("rejects request with malformed json", async () => {
    await testExpectedResponseCodeForBody("{", 400, {
      status: StatusCodes.INVALID_INPUT,
    });
  });

  it("rejects request with a missing value", async () => {
    await testExpectedResponseCodeForBody("{}", 400, {
      status: StatusCodes.INVALID_INPUT,
    });
  });

  async function testExpectedResponseCodeForBody(
    body: string | undefined,
    expectedResponseCode: number,
    expectedResponseBody: Record<string, unknown>,
    user: User = voter
  ) {
    const dependencies = {
      insertVote: fn(), // TODO: this shouldn't really be a dependency
      insertSongRequest: fn(),
      allowedOrigins: new Set([origin]),
      getIdentityFromRequest: () => user,
      voteMode: () => VoteModes.DOLLAR_VOTE,
    };

    const event = {
      pathParameters: { songId },
      headers: {
        origin,
      },
      body: body,
    } as unknown as APIGatewayProxyEvent;

    const voteForSong = AddVoteToSong.createVoteForSongLambda(dependencies);
    const result = await voteForSong(event);

    expect(result.statusCode).toEqual(expectedResponseCode);

    expect(JSON.parse(result.body)).toMatchObject(expectedResponseBody);

    verifyCORSHeaders(result, origin);
  }
});
