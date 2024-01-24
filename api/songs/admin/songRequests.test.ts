import { describe } from "@jest/globals";
import { Paginated } from "../domain/songs";
import {
  createSongRequestsLambda,
  Dependencies,
  SongRequest,
} from "./songRequests";
import { APIGatewayProxyEvent } from "aws-lambda";
import MockedFn = jest.MockedFn;
import fn = jest.fn;
import { verifyCORSHeaders } from "../http/headers.testing";
import { StatusCodes } from "../util/statusCodes";
import { DateTime } from "luxon";

describe("the dollar votes admin api", () => {
  const origin = "https://example.com";
  const user1 = { id: "user1", name: "User 1" };
  const song1 = {
    id: "song1",
    title: "Song 1",
  };
  const request1Timestamp = "2024-01-24T14:20:05Z";
  const request1: SongRequest = {
    id: "request1",
    requestedBy: user1,
    song: song1,
    value: 10,
    status: "PENDING_APPROVAL",
    timestamp: DateTime.fromISO(request1Timestamp).toUTC(),
  };

  const request2Timestamp = "2024-01-24T04:20:05Z";
  const request2: SongRequest = {
    id: "request2",
    requestedBy: user1,
    song: song1,
    value: 99,
    status: "APPROVED",
    timestamp: DateTime.fromISO(request2Timestamp).toUTC(),
  };

  it("gets all current dollar requests", async () => {
    const event = {
      headers: { origin },
      body: null,
    } as unknown as APIGatewayProxyEvent;

    const findAllSongRequests: MockedFn<Dependencies["findAllSongRequests"]> =
      fn();

    findAllSongRequests.mockResolvedValue({
      thisPage: "",
      page: [request1, request2],
    });

    const dependencies = {
      findAllSongRequests,
      allowedOrigins: new Set([origin]),
    };
    const lambda = createSongRequestsLambda(dependencies);
    const response = await lambda(event);
    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body)).toMatchObject({
      status: StatusCodes.Ok,
      data: {
        page: [
          {
            requestId: "request2",
            requestedBy: user1,
            song: song1,
            value: 99,
            timestamp: request2Timestamp,
          },
          {
            requestId: "request1",
            requestedBy: user1,
            song: song1,
            value: 10,
            timestamp: request1Timestamp,
          },
        ],
      },
    });

    verifyCORSHeaders(response, origin);
  });
});
