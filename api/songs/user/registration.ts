import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { CORSEnabled, generateHeadersForDataResponse } from "../http/headers";
import { User, UserInput } from "../domain/user";

export interface Dependencies extends CORSEnabled {
  insertUser: (user: UserInput) => Promise<User>;
}

export const createRegisterUserLambda = (dependencies: Dependencies) => {
  const { allowedOrigins, insertUser } = dependencies;
  return async (
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> => {
    const userInput: { name: string } = JSON.parse(event.body || "");
    //TODO (MVP): check all required inputs are populated
    const insertedUser = await insertUser(userInput);
    return generateHeadersForDataResponse(
      insertedUser,
      event.headers,
      allowedOrigins
    );
  };
};
