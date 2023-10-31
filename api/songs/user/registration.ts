import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  CORSEnabled,
  generateResponseHeadersForDataResponse,
} from "../http/headers";
import { User, UserInput } from "../domain/user";

export interface Dependencies extends CORSEnabled {
  insertUser: (user: UserInput) => Promise<User>;
  generateToken: (user: User) => Promise<string>;
}

export const createRegisterUserLambda = (dependencies: Dependencies) => {
  const { allowedOrigins, insertUser, generateToken } = dependencies;
  return async (
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> => {
    const userInput: { name: string } = JSON.parse(event.body || "");
    //TODO (MVP): check all required inputs are populated
    const insertedUser: User = await insertUser(userInput);
    const token = await generateToken(insertedUser);
    const payload = { user: insertedUser, token };
    return generateResponseHeadersForDataResponse(
      payload,
      event.headers,
      allowedOrigins
    );
  };
};
