import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { User } from "../domain/user";
import {
  CORSEnabled,
  generateResponseHeaders,
  generateResponseHeadersForDataResponse,
} from "../http/headers";

export interface Dependencies extends CORSEnabled {
  validateCredentials: (
    username: string,
    password: string
  ) => Promise<User | undefined>;
  generateToken: (user: User) => Promise<string>;
}

interface Credentials {
  username: string;
  password: string;
}

export const createAdminLoginLambda = (dependencies: Dependencies) => {
  const { validateCredentials, generateToken, allowedOrigins } = dependencies;
  return async (
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> => {
    // TODO: verify there is a body and that it has all required fields
    const credentials: Credentials = JSON.parse(event.body!);
    const maybeAdmin = await validateCredentials(
      credentials.username,
      credentials.password
    );

    if (maybeAdmin) {
      if (maybeAdmin.roles?.find((r) => r == "administrator")) {
        const token = await generateToken(maybeAdmin);
        const data = {
          user: maybeAdmin,
          token,
        };
        return generateResponseHeadersForDataResponse(
          data,
          event.headers,
          allowedOrigins
        );
      } else {
        return generateResponseHeaders(event.headers, allowedOrigins, 403, {
          status: "ERR",
        });
      }
    } else {
      return generateResponseHeaders(event.headers, allowedOrigins, 401, {
        status: "ERR",
      });
    }
  };
};
