import { APIGatewayProxyEvent } from "aws-lambda";
import { User } from "../domain/user";
import * as jwt from "jsonwebtoken";
import { createGetIdentityFromRequest } from "../authz/token";
import { SongRequestInput, Vote } from "./domain";
import { createDollarVoteModeLambda } from "./dollarVoteLambda";
import fn = jest.fn;
import MockedFunction = jest.MockedFunction;
import resetAllMocks = jest.resetAllMocks;
import { StatusCode } from "../util/statusCodes";

describe("add vote to song", () => {
  const requestSong: MockedFunction<
    (
      vote: SongRequestInput
    ) => Promise<{ requestId: string; status: StatusCode }>
  > = fn();

  const secret = "secret-key";
  const voter: User = {
    id: "u:voter1",
    name: "Voter 1",
  };
  const token = jwt.sign(voter, secret);

  const dependencies = {
    requestSong,
    allowedOrigins: new Set(""),
    getIdentityFromRequest: createGetIdentityFromRequest(secret),
  };

  beforeEach(() => {
    resetAllMocks();
    requestSong.mockResolvedValue({ requestId: "", status: "OK" });
  });

  it("records the vote for the user", async () => {
    const songId = "s:123123";

    const event = {
      pathParameters: { songId },
      headers: { origin: "", "x-token": `Bearer ${token}` },
      body: JSON.stringify({
        value: 10,
      }),
    } as unknown as APIGatewayProxyEvent;

    const voteForSong = createDollarVoteModeLambda(dependencies);
    const result = await voteForSong(event);
    const statusMessage = JSON.parse(result.body);

    const expectedVote: Vote = {
      songId,
      voter,
    };

    expect(result.statusCode).toEqual(200);
    expect(statusMessage).toMatchObject({
      status: "OK",
    });
    expect(requestSong.mock.calls.length).toEqual(1);
    expect(requestSong.mock.calls[0][0]).toMatchObject(expectedVote);
  });

  //TODO: don't allow vote if user already voted
  //TODO: song not found
  //TODO: song id not provided
  //TODO: don't allow and return 401 if no token or user
});
