import { APIGatewayProxyEvent } from "aws-lambda";
import * as AddVoteToSong from "./voteForSong";
import { Dependencies } from "./voteForSong";
import fn = jest.fn;
import MockedFunction = jest.MockedFunction;
import resetAllMocks = jest.resetAllMocks;

describe("add vote to song", () => {
  const incrementSongVotesFnMock: MockedFunction<
    Dependencies["incrementSongVotes"]
  > = fn();

  const dependencies = {
    incrementSongVotes: incrementSongVotesFnMock,
    allowedOrigins: new Set(""),
  };

  beforeEach(() => {
    resetAllMocks();
  });

  it("increments the vote count", async () => {
    const songId = "s: 123123";

    const event = {
      pathParameters: { songId },
      headers: { origin: "" },
    } as unknown as APIGatewayProxyEvent;

    incrementSongVotesFnMock.mockResolvedValueOnce(1);

    const voteForSong = AddVoteToSong.createVoteForSongLambda(dependencies);
    const result = await voteForSong(event);
    const statusMessage = JSON.parse(result.body);

    expect(incrementSongVotesFnMock.mock.calls.length).toEqual(1);
    expect(incrementSongVotesFnMock.mock.calls[0][0]).toEqual(songId);
    expect(result.statusCode).toEqual(200);
    expect(statusMessage).toMatchObject({
      status: "OK",
    });
  });

  // it("returns error condition when song isn't found", async () => {
  //   const event = {
  //     pathParameters: { songId: "non-existent" },
  //     headers: { origin: "" },
  //   } as unknown as APIGatewayProxyEvent;
  //
  //   const voteForSong = AddVoteToSong.createAddVoteToSongLambda(dependencies);
  //   const result = await voteForSong(event);
  //
  //   expect(incrementSongVotesFnMock.mock.calls.length).toEqual(1);
  //   expect(incrementSongVotesFnMock.mock.calls[0][0]).toEqual("non-existent");
  //   expect(result.statusCode).toEqual(200);
  // });

  //TODO: don't allow vote if user is out
  //TODO: don't allow vote if user already voted
  //TODO: don't allow vote if not a POST
  //TODO: song not found
  //TODO: song id not provided
});
