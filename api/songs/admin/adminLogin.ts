import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { User, UserInput } from "../domain/user";
import { logger } from "../util/logger";

export interface Dependencies {
  validateCredentials: (username: string, password: string) => Promise<boolean>;
  generateToken: (user: User) => Promise<string>;
  insertUser: (user: UserInput) => Promise<User>;
  getIdentityFromRequest: (event: APIGatewayProxyEvent) => User | undefined;
}

interface Credentials {
  username: string;
  password: string;
}

export const createAdminLoginLambda = (dependencies: Dependencies) => {
  const {
    validateCredentials,
    generateToken,
    insertUser,
    getIdentityFromRequest,
  } = dependencies;
  return async (
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> => {
    // TODO: verify there is a body and that it has all required fields
    const credentials: Credentials = JSON.parse(event.body!);

    if (await validateCredentials(credentials.username, credentials.password)) {
      const identity = getIdentityFromRequest(event);
      if (identity) {
        if (identity.name != credentials.username) {
          logger.warn(
            `A pre-existing user ${identity.id} is trying to log in as admin with a different username than what is in their token`
          );
          return {
            statusCode: 401,
            body: JSON.stringify({
              status: "ERR",
              description: "You have a token that doesn't match the username",
            }),
          };
        }
      }
      //TODO: there is some weirdness here because roles aren't yet saved in the user database.
      //  That should be changed most likely. Investigate me.
      const insertedUser: User = await insertUser({
        name: credentials.username,
      });
      const roles = ["administrator"];
      const adminUser: User = {
        ...insertedUser,
        roles,
      };
      const token = await generateToken(adminUser);
      return {
        statusCode: 200,
        body: JSON.stringify({ user: adminUser, token }),
      };
    } else {
      return {
        statusCode: 401,
        body: JSON.stringify({ status: "ERR" }),
      };
    }
  };
};
