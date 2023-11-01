import * as jwt from "jsonwebtoken";
import { User } from "../domain/user";
import { APIGatewayProxyEvent } from "aws-lambda";
import { getHeaderByName } from "../http/headers";

interface Dependencies {
  secret: string;
}

export const createGenerateToken = (dependencies: Dependencies) => {
  return async (user: User) => {
    const { secret } = dependencies;

    return jwt.sign(user, secret, { algorithm: "HS256" });
  };
};

export const createGetIdentityFromRequest = (secret: string) => {
  return (event: APIGatewayProxyEvent) => {
    // TODO: type assertion that header is string
    const tokenHeader = getHeaderByName(event.headers, "x-token") as string;
    const token = tokenHeader.match(/Bearer (?<token>.*)/i)?.groups?.["token"];
    if (token) {
      const theJwt = jwt.verify(token, secret, { complete: true });
      const payload = theJwt.payload;
      return payload as User;
    } else {
      return undefined;
    }
  };
};
