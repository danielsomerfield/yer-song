import * as Registration from "./registration";
import { APIGatewayProxyEvent } from "aws-lambda";
import fn = jest.fn;
import MockedFn = jest.MockedFn;

import { UserInput } from "../domain/user";

describe("the registration process", () => {
  it("saves a user record", async () => {
    const newUserId = "generatedId";
    const newUserName = "Bob the bob";

    const insertUserMock: MockedFn<
      (user: UserInput) => Promise<{ id: string; name: string }>
    > = fn();
    const dependencies: Registration.Dependencies = {
      allowedOrigins: new Set([""]),
      insertUser: insertUserMock,
    };

    insertUserMock.mockResolvedValueOnce({
      id: newUserId,
      name: newUserName,
    });

    const event = {
      headers: { origin: "" },
      body: `{ "name": "${newUserName}" }`,
    } as unknown as APIGatewayProxyEvent;

    const registerUserLambda =
      Registration.createRegisterUserLambda(dependencies);
    const response = await registerUserLambda(event);
    expect(response.statusCode).toEqual(200);
    expect(insertUserMock.mock.calls.length).toEqual(1);
    expect(insertUserMock.mock.calls[0].length).toEqual(1);
    expect(insertUserMock.mock.calls[0][0]).toMatchObject({
      name: newUserName,
    });
    expect(JSON.parse(response.body)).toMatchObject({
      status: "OK",
      data: {
        id: newUserId,
        name: newUserName,
      },
    });
  });
});
