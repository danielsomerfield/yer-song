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
  DENIED: "DENIED",
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
  findAllSongRequestsWithStatuses: (
    status: (status: RequestStatus) => boolean
  ) => Promise<Paginated<SongRequest>>;
}

export const createGetSongRequestsLambda = (dependencies: Dependencies) => {
  const { allowedOrigins, findAllSongRequestsWithStatuses } = dependencies;
  return async (
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> => {
    const filterNames = event.multiValueQueryStringParameters?.status;
    const filter = (status: RequestStatus): boolean => {
      return filterNames == undefined || filterNames?.includes(status);
    };

    const requests = await findAllSongRequestsWithStatuses(filter);
    return generateResponseHeadersForDataResponse(
      {
        page: requests.page
          .sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis())
          .map((r) => {
            return {
              requestId: r.id,
              requestedBy: r.requestedBy,
              song: r.song,
              value: r.value,
              status: r.status,
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
