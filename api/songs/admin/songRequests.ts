import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  CORSEnabled,
  generateResponseHeadersForDataResponse,
} from "../http/headers";
import { DateTime } from "luxon";
import { Paginated } from "../domain/songs";

export const RequestStatuses = {
  PENDING_APPROVAL: "PENDING_APPROVAL",
  APPROVED: "APPROVED",
} as const;

export type RequestStatus = keyof typeof RequestStatuses;

export interface SongRequest {
  id: string;
  status: RequestStatus;
  requestedBy: {
    id: string;
    name: string;
  };
  song: {
    id: string;
    title: string;
  };
  value: number;
  timestamp: DateTime;
}

export interface Dependencies extends CORSEnabled {
  findAllSongRequests: () => Promise<Paginated<SongRequest>>;
}

export const createSongRequestsLambda = (dependencies: Dependencies) => {
  const { allowedOrigins, findAllSongRequests } = dependencies;
  return async (
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> => {
    const requests = await findAllSongRequests();
    return generateResponseHeadersForDataResponse(
      {
        page: requests.page
          .sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis())
          .map((r) => {
            return {
              requestId: r.id,
              requestedBy: r.requestedBy,
              song: r.song,
              value: r.value,
              timestamp: r.timestamp
                .toUTC()
                .toISO({ suppressMilliseconds: true }),
            };
          }),
      },
      event.headers,
      allowedOrigins
    );
  };
};
