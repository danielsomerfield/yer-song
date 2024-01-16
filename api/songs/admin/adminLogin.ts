import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export interface Dependencies {
  validateCredentials: (username: string, password: string) => boolean;
}

export const createAdminLoginLambda = (dependencies: Dependencies) => {
  return async (
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> => {
    throw "NYI";
  };
};
