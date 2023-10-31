import { createAuthorization, Lambda } from "./authorization";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as jwt from "jsonwebtoken";

import fn = jest.fn;
import MockedFunction = jest.MockedFunction;
import { User } from "../domain/user";

describe("authorization", () => {
  describe("requireUser", () => {
    const user: User = {
      id: "user1",
      name: "User 1",
    };

    const secret = "blahblahblah";

    const token = jwt.sign(user, secret, { algorithm: "HS256" });

    const config = {
      secret,
    };

    const authorization = createAuthorization(
      { allowedOrigins: new Set() },
      config
    );

    it("prevent a user from accessing the lambda if they haven't logged in ", async () => {
      const lambda: MockedFunction<Lambda> = fn();
      lambda.mockResolvedValue({ statusCode: 200 } as APIGatewayProxyResult);
      const lambdaWithUserRequirements = authorization.requireUser(lambda);
      const event = {} as unknown as APIGatewayProxyEvent;

      const response = await lambdaWithUserRequirements(event);
      expect(lambda).not.toHaveBeenCalled();
      expect(response.statusCode).toEqual(401);
    });

    it("allows a user to access the lambda if they have logged in ", async () => {
      const lambda: MockedFunction<Lambda> = fn();
      lambda.mockResolvedValue({ statusCode: 200 } as APIGatewayProxyResult);
      const lambdaWithUserRequirements = authorization.requireUser(lambda);
      const event = {
        headers: { Authorization: `Bearer ${token}` },
      } as unknown as APIGatewayProxyEvent;

      const response = await lambdaWithUserRequirements(event);
      expect(lambda).toHaveBeenCalled();
      expect(response.statusCode).toEqual(200);
    });
  });
});
