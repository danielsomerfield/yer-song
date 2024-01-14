import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { CORSEnabled, generateResponseHeaders } from "../http/headers";
import { createGetIdentityFromRequest } from "./token";

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

  const getIdentity = createGetIdentityFromRequest(secret);

  const requireUser = (lambda: Lambda): Lambda => {
    return async (event: APIGatewayProxyEvent) => {
      // TODO: refactor this with token.ts
      const identity = getIdentity(event);
      if (identity) {
        return lambda(event);
      } else {
        return generateResponseHeaders(event.headers, allowedOrigins, 401, {});
      }
    };
  };

  const requireAdmin = (lambda: Lambda): Lambda => {
    return async (event: APIGatewayProxyEvent) => {
      return lambda(event);
    };
  };

  return {
    requireUser,
    requireAdmin,
  };
};
