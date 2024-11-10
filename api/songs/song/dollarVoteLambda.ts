import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  generateResponseHeaders,
  generateResponseHeadersForDataResponse,
} from "../http/headers";
import { StatusCode, StatusCodes } from "../util/statusCodes";
import { User } from "../domain/user";
import { Maybe } from "../util/maybe";
import { SongRequestInput } from "./domain";

interface SongRequest {
  songId: string;
  value: number;
  voter: User;
  voucher?: string;
}

interface Dependencies {
  getIdentityFromRequest: (event: APIGatewayProxyEvent) => Maybe<User>;
  requestSong(request: SongRequestInput): Promise<RequestSongResult>;
  allowedOrigins: Set<string>;
}

interface RequestSongResult {
  requestId: string;
  status: StatusCode;
}

export const createDollarVoteModeLambda = (dependencies: Dependencies) => {
  const { allowedOrigins, getIdentityFromRequest, requestSong } = dependencies;
  return async (
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> => {
    if (!event.body || event.body.length == 0) {
      return generateResponseHeadersForDataResponse(
        {
          message: "Missing required body",
        },
        event.headers,
        allowedOrigins,
        StatusCodes.INVALID_INPUT,
        400
      );
    }

    const voter = getIdentityFromRequest(event);
    const songId = event.pathParameters?.["songId"];

    // TODO: we should be able to eliminate this code with better typing
    if (!voter || !songId) {
      throw "NYI";
    }

    let songRequest: SongRequest;
    try {
      songRequest = JSON.parse(event.body!);
      if (!songRequest.value || songRequest.value < 1) {
        return generateResponseHeadersForDataResponse(
          {
            message: `Invalid request value: ${songRequest.value}`,
          },
          event.headers,
          allowedOrigins,
          StatusCodes.INVALID_INPUT,
          400
        );
      }
    } catch (e) {
      return generateResponseHeadersForDataResponse(
        {
          message: "Invalid JSON",
        },
        event.headers,
        allowedOrigins,
        StatusCodes.INVALID_INPUT,
        400
      );
    }

    const { requestId, status } = await requestSong({
      songId,
      voter,
      value: songRequest.value,
      voucher: songRequest.voucher,
    });

    return generateResponseHeaders(
      event.headers,
      allowedOrigins,
      status == StatusCodes.Ok ? 200 : 422,
      {
        data: {
          requestId,
        },
        status,
      }
    );
  };
};
