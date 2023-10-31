import * as Registration from "./registration";
import { APIGatewayProxyEvent } from "aws-lambda";
import fn = jest.fn;
import MockedFn = jest.MockedFn;

import { User, UserInput } from "../domain/user";
import { verifyCORSHeaders } from "../http/headers.testing";

describe("the registration process", () => {
  const origin = "https://example.com";
  const theToken = "the token";

  it("saves a user record", async () => {
    const newUserId = "generatedId";
    const newUserName = "Bob the bob";

    const insertUserMock: MockedFn<
      (user: UserInput) => Promise<{ id: string; name: string }>
    > = fn();

    const generateToken: MockedFn<(user: User) => Promise<string>> = fn();

    const dependencies: Registration.Dependencies = {
      allowedOrigins: new Set([origin]),
      insertUser: insertUserMock,
      generateToken,
    };

    insertUserMock.mockResolvedValueOnce({
      id: newUserId,
      name: newUserName,
    });

    generateToken.mockResolvedValueOnce(theToken);

    const event = {
      headers: { origin },
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
        user: { id: newUserId, name: newUserName },
        token: theToken,
      },
    });

    expect(generateToken).toBeCalledWith({ id: newUserId, name: newUserName });

    verifyCORSHeaders(response, origin);
  });

  //   TODO (mvp): prevent registration for existing user
});
