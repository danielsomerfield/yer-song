import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  generateResponseHeaders,
  generateResponseHeadersForDataResponse,
} from "../http/headers";
import { StatusCodes } from "../util/statusCodes";
import { Dependencies } from "./voteForSong";
import { User } from "../domain/user";

interface SongRequest {
  songId: string;
  value: number;
  voter: User;
  voucher?: string;
}

export const createDollarVoteModeLambda = (dependencies: Dependencies) => {
  const {
    allowedOrigins,
    getIdentityFromRequest,
    insertSongRequest,
    verifyVoucher,
  } = dependencies;
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

    if (songRequest.voucher) {
      const verification = verifyVoucher(songRequest.voucher, songRequest);
      if (verification != StatusCodes.Ok) {
        return generateResponseHeadersForDataResponse(
          {
            message: "unknown voucher",
          },
          event.headers,
          allowedOrigins,
          verification,
          422
        );
      }
    }

    const { requestId } = await insertSongRequest({
      songId,
      voter,
      value: songRequest.value,
      voucher: songRequest.voucher,
    });
    return generateResponseHeaders(event.headers, allowedOrigins, 200, {
      data: {
        requestId,
      },
      status: "OK",
    });
  };
};
