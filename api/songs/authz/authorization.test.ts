import { createAuthorization, Lambda } from "./authorization";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as jwt from "jsonwebtoken";
import { User } from "../domain/user";
import fn = jest.fn;
import MockedFunction = jest.MockedFunction;

describe("authorization", () => {
  const secret = "blahblahblah";
  const config = {
    secret,
  };
  const authorization = createAuthorization(
    { allowedOrigins: new Set() },
    config
  );

  describe("requireUser", () => {
    const user: User = {
      id: "user1",
      name: "User 1",
    };
    const token = jwt.sign(user, secret, { algorithm: "HS256" });

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
        headers: { "x-token": `Bearer ${token}` },
      } as unknown as APIGatewayProxyEvent;

      const response = await lambdaWithUserRequirements(event);
      expect(lambda).toHaveBeenCalled();
      expect(response.statusCode).toEqual(200);
    });
  });

  describe("requireAdmin", () => {
    const secret = "blahblahblah";
    const regularUser: User = {
      id: "user1",
      name: "User 1",
    };
    const regularUserToken = jwt.sign(regularUser, secret, {
      algorithm: "HS256",
    });

    const adminUser: User = {
      id: "user1",
      name: "User 1",
      roles: ["administrator"],
    };
    const adminUserToken = jwt.sign(adminUser, secret, {
      algorithm: "HS256",
    });

    it("prevents valid non-admin users from running the protected lambda", async () => {
      const lambda: MockedFunction<Lambda> = fn();
      lambda.mockResolvedValue({ statusCode: 200 } as APIGatewayProxyResult);
      const lambdaWithUserRequirements = authorization.requireAdmin(lambda);
      const event = {
        headers: { "x-token": `Bearer ${regularUserToken}` },
      } as unknown as APIGatewayProxyEvent;

      const response = await lambdaWithUserRequirements(event);
      expect(lambda).not.toHaveBeenCalled();
      expect(response.statusCode).toEqual(403);
    });

    it("allows admin user to run the lambda", async () => {
      const lambda: MockedFunction<Lambda> = fn();
      lambda.mockResolvedValue({ statusCode: 200 } as APIGatewayProxyResult);
      const lambdaWithUserRequirements = authorization.requireAdmin(lambda);
      const event = {
        headers: { "x-token": `Bearer ${adminUserToken}` },
      } as unknown as APIGatewayProxyEvent;

      const response = await lambdaWithUserRequirements(event);
      expect(response.statusCode).toEqual(200);
      expect(lambda).toHaveBeenCalled();
    });
  });
});
