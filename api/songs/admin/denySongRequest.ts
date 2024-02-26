import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  CORSEnabled,
  generateResponseHeaders,
  generateResponseHeadersForDataResponse,
} from "../http/headers";
import { StatusCodes } from "../util/statusCodes";

export interface SongRequestDenial {
  requestId: string;
  songId: string;
}

export interface Dependencies extends CORSEnabled {
  denyRequest: (denial: SongRequestDenial) => Promise<void>;
}
export const createDenySongRequest = (dependencies: Dependencies) => {
  const { allowedOrigins } = dependencies;
  return async (
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> => {
    const { denyRequest } = dependencies;

    if (!event.body) {
      return generateResponseHeaders(event.headers, allowedOrigins, 400, {
        status: StatusCodes.INVALID_INPUT,
      });
    }

    const request: SongRequestDenial = JSON.parse(event.body);
    if (!request.requestId || !request.songId) {
      return generateResponseHeaders(event.headers, allowedOrigins, 400, {
        status: StatusCodes.INVALID_INPUT,
      });
    }

    await denyRequest(request);

    return generateResponseHeadersForDataResponse(
      {},
      event.headers,
      allowedOrigins
    );
  };
};
