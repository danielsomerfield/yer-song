import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { User } from "../domain/user";

export interface Dependencies {
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
  const { validateCredentials, generateToken } = dependencies;
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
        return {
          statusCode: 200,
          body: JSON.stringify({ user: maybeAdmin, token }),
        };
      } else {
        return {
          statusCode: 403,
          body: JSON.stringify({ status: "ERR" }),
        };
      }
    } else {
      return {
        statusCode: 401,
        body: JSON.stringify({ status: "ERR" }),
      };
    }
  };
};
