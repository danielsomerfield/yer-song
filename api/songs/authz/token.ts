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
    const tokenHeader = getHeaderByName(event.headers, "x-token");
    const token = tokenHeader?.match(/Bearer (?<token>.*)/i)?.groups?.["token"];
    if (token) {
      try {
        const theJwt = jwt.verify(token, secret, { complete: true });
        const payload = theJwt.payload;
        const user = payload as User;
        return user.id && user.name ? user : undefined;
      } catch (err) {
        return undefined;
      }
    } else {
      return undefined;
    }
  };
};
