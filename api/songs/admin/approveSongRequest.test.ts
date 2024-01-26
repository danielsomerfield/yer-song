import { describe } from "@jest/globals";
import { verifyCORSHeaders } from "../http/headers.testing";
import { APIGatewayProxyEvent } from "aws-lambda";
import { StatusCodes } from "../util/statusCodes";
import MockedFn = jest.MockedFn;
import fn = jest.fn;
import resetAllMocks = jest.resetAllMocks;
import { Approval, createApproveSongRequest } from "./approveSongRequest";

describe("the modify song request lambda", () => {
  const origin = "https://example.com";
  const songId = "song1";
  const requestId = "request1";
  const value = 42;

  beforeEach(() => {
    resetAllMocks();
  });

  const approveRequest: MockedFn<(approval: Approval) => Promise<void>> = fn();

  const dependencies = {
    allowedOrigins: new Set([origin]),
    approveRequest,
  };

  it("adds song to the playlist on approval", async () => {
    const event = {
      headers: { origin },
      body: JSON.stringify({
        songId,
        requestId,
        value,
      }),
    } as unknown as APIGatewayProxyEvent;
    const lambda = createApproveSongRequest(dependencies);
    const response = await lambda(event);

    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body)).toMatchObject({
      status: StatusCodes.Ok,
    });

    expect(approveRequest).toBeCalledWith(
      expect.objectContaining({
        songId,
        requestId,
        value,
      })
    );

    verifyCORSHeaders(response, origin);
  });

  it("returns a 400 on malformed inputs", async () => {
    async function runMalformedInputTest(
      bodyInput: Partial<Approval> | string
    ) {
      const event = {
        headers: { origin },
        body: JSON.stringify(bodyInput),
      } as unknown as APIGatewayProxyEvent;

      const lambda = createApproveSongRequest(dependencies);
      const response = await lambda(event);

      expect(response.statusCode).toEqual(400);
      expect(JSON.parse(response.body)).toMatchObject({
        status: StatusCodes.INVALID_INPUT,
      });

      expect(approveRequest).not.toBeCalled();

      verifyCORSHeaders(response, origin);
    }

    await runMalformedInputTest({ songId, requestId });
    await runMalformedInputTest({ songId, value: 123 });
    await runMalformedInputTest({ value: 123, requestId });
    await runMalformedInputTest("asdf");
  });
});

// TODO: test cases
//  - already approved
