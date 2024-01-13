import { createGetIdentityFromRequest } from "./token";
import { APIGatewayProxyEvent } from "aws-lambda";
import * as jwt from "jsonwebtoken";
import { User } from "../domain/user";

describe("tokens", () => {
  it("gets identity from the request jwt", () => {
    const secret = "the secret";
    const user: User = {
      id: "id1",
      name: "user1",
    };
    const token = jwt.sign(user, secret, { algorithm: "HS256" });

    const event = {
      headers: { "x-token": `Bearer ${token}` },
    } as unknown as APIGatewayProxyEvent;

    const response = createGetIdentityFromRequest(secret)(event);
    expect(response).toBeDefined();
    expect(response).toMatchObject(user);
  });

  it("identifies no user from a non-existent token", () => {
    const secret = "the secret";

    const event = {
      headers: {},
    } as unknown as APIGatewayProxyEvent;

    const response = createGetIdentityFromRequest(secret)(event);
    expect(response).toBeUndefined();
  });

  it("identifies no user from an invalid token header", () => {
    const secret = "the secret";
    const event = {
      headers: { "x-token": `invalid` },
    } as unknown as APIGatewayProxyEvent;

    const response = createGetIdentityFromRequest(secret)(event);
    expect(response).toBeUndefined();
  });

  it("identifies no user from an invalid token ", () => {
    const secret = "the secret";
    const event = {
      headers: { "x-token": `Bearer invalid` },
    } as unknown as APIGatewayProxyEvent;

    const response = createGetIdentityFromRequest(secret)(event);
    expect(response).toBeUndefined();
  });

  it("identifies no user from a valid token with no user in it", () => {
    const secret = "the secret";
    const token = jwt.sign({}, secret, { algorithm: "HS256" });

    const event = {
      headers: { "x-token": `Bearer ${token}` },
    } as unknown as APIGatewayProxyEvent;

    const response = createGetIdentityFromRequest(secret)(event);
    expect(response).toBeUndefined();
  });
});
