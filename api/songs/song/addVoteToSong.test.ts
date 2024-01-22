import { APIGatewayProxyEvent } from "aws-lambda";
import * as AddVoteToSong from "./voteForSong";
import { Vote, VoteModes } from "./voteForSong";
import { User } from "../domain/user";
import * as jwt from "jsonwebtoken";
import { createGetIdentityFromRequest } from "../authz/token";
import fn = jest.fn;
import MockedFunction = jest.MockedFunction;
import resetAllMocks = jest.resetAllMocks;
import { verifyCORSHeaders } from "../http/headers.testing";

describe("add vote to song", () => {
  const insertVote: MockedFunction<(vote: Vote) => Promise<void>> = fn();
  const secret = "secret-key";

  const voter: User = {
    id: "u:voter1",
    name: "Voter 1",
  };
  const token = jwt.sign(voter, secret);

  const dependencies = {
    insertVote,
    insertSongRequest: fn(), // TODO: we should be able to get rid of this dependency. It's a byproduct of coupling the two vote functions
    allowedOrigins: new Set(""),
    getIdentityFromRequest: createGetIdentityFromRequest(secret),
    voteMode: () => VoteModes.SINGLE_VOTE,
  };

  beforeEach(() => {
    resetAllMocks();
  });

  it("records the vote for the user", async () => {
    const songId = "s:123123";

    const event = {
      pathParameters: { songId },
      headers: { origin: "", "x-token": `Bearer ${token}` },
    } as unknown as APIGatewayProxyEvent;

    const voteForSong = AddVoteToSong.createVoteForSongLambda(dependencies);
    const result = await voteForSong(event);
    const statusMessage = JSON.parse(result.body);

    const expectedVote: Vote = {
      songId,
      voter,
    };
    expect(insertVote.mock.calls.length).toEqual(1);
    expect(insertVote.mock.calls[0][0]).toMatchObject(expectedVote);
    expect(result.statusCode).toEqual(200);
    expect(statusMessage).toMatchObject({
      status: "OK",
    });
  });

  //TODO: don't allow vote if user already voted
  //TODO: song not found
  //TODO: song id not provided
  //TODO: don't allow and return 401 if no token or user
});
