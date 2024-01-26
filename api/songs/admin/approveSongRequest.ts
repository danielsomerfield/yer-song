import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  CORSEnabled,
  generateResponseHeaders,
  generateResponseHeadersForDataResponse,
} from "../http/headers";
import { StatusCodes } from "../util/statusCodes";

export interface Approval {
  requestId: string;
  songId: string;
  value: number;
}

export interface Dependencies extends CORSEnabled {
  approveRequest: (approval: Approval) => Promise<void>;
}
export const createApproveSongRequest = (dependencies: Dependencies) => {
  const { allowedOrigins, approveRequest } = dependencies;
  return async (
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> => {
    const approval: Approval = JSON.parse(event.body!);
    if (!approval.value || !approval.requestId || !approval.songId) {
      return generateResponseHeaders(event.headers, allowedOrigins, 400, {
        status: StatusCodes.INVALID_INPUT,
      });
    }

    await approveRequest(approval);

    return generateResponseHeadersForDataResponse(
      {},
      event.headers,
      allowedOrigins
    );
  };
};
