import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  CORSEnabled,
  generateResponseHeaders,
  getHeaderByName,
} from "../http/headers";
import * as jwt from "jsonwebtoken";
import { logger } from "../util/logger";

export interface AuthConfiguration {
  secret: string;
}

export type Dependencies = CORSEnabled;

export type Lambda = (
  event: APIGatewayProxyEvent
) => Promise<APIGatewayProxyResult>;

export const createAuthorization = (
  dependencies: Dependencies,
  authConfiguration: AuthConfiguration
) => {
  const { secret } = authConfiguration;
  const { allowedOrigins } = dependencies;

  const requireUser = (lambda: Lambda): Lambda => {
    return async (event: APIGatewayProxyEvent) => {
      const authHeaderValue = getHeaderByName(event.headers, "x-token");
      if (authHeaderValue) {
        const authHeaderString = authHeaderValue.toString();
        const token =
          authHeaderString.match(/Bearer (?<token>.*)/i)?.groups?.["token"];
        if (token) {
          try {
            jwt.verify(token, secret);
            return lambda(event);
          } catch (e) {
            logger.warn(e, "Failed to verify user");
          }
        }
      }
      return generateResponseHeaders(event.headers, allowedOrigins, 401, {});
    };
  };

  return {
    requireUser,
  };
};
