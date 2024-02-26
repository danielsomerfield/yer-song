import { describe } from "@jest/globals";
import { APIGatewayProxyEvent } from "aws-lambda";
import { createDenySongRequest, Dependencies } from "./denySongRequest";
import { StatusCodes } from "../util/statusCodes";
import MockedFn = jest.MockedFn;
import fn = jest.fn;

describe("deny song request lambda", () => {
  const origin = "https://example.com";
  const songId = "song1";
  const requestId = "request1";

  it("removes the request from the underlying store", async () => {
    const removeRequest: MockedFn<Dependencies["denyRequest"]> = fn();

    const dependencies = {
      denyRequest: removeRequest,
      allowedOrigins: new Set([origin]),
    } as Dependencies;

    const event = {
      headers: { origin },
      body: JSON.stringify({
        songId,
        requestId,
      }),
    } as unknown as APIGatewayProxyEvent;

    const lambda = createDenySongRequest(dependencies);
    const response = await lambda(event);
    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body)).toMatchObject({
      status: StatusCodes.Ok,
    });

    expect(removeRequest).toBeCalledWith({ songId, requestId });
  });
});
