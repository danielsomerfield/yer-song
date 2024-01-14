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
      const identity = getIdentity(event);
      if (identity) {
        const find = identity.roles?.find((r) => r == "administrator");
        if (find) {
          return lambda(event);
        } else {
          return generateResponseHeaders(
            event.headers,
            allowedOrigins,
            403,
            {}
          );
        }
      } else {
        return generateResponseHeaders(event.headers, allowedOrigins, 401, {});
      }
    };
  };

  return {
    requireUser,
    requireAdmin,
  };
};
