import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { CORSEnabled, generateResponseHeaders } from "../http/headers";
import { createGetIdentityFromRequest } from "./token";
import { User } from "../domain/user";

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

  const hasRole = (identity: User, requiredRole: string | undefined) => {
    return identity.roles?.find((r) => r == requiredRole);
  };

  const requireUserWithRole = (
    lambda: Lambda,
    requiredRole: string | undefined = undefined
  ): Lambda => {
    return async (event: APIGatewayProxyEvent) => {
      const identity = getIdentity(event);

      if (identity) {
        if (!requiredRole || hasRole(identity, requiredRole)) {
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

  const requireUser = (lambda: Lambda): Lambda => {
    return requireUserWithRole(lambda);
  };

  const requireAdmin = (lambda: Lambda): Lambda => {
    return requireUserWithRole(lambda, "administrator");
  };

  return {
    requireUser,
    requireAdmin,
  };
};
