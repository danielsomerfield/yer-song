import { User } from "./users";
import { ReturnOrError, StatusCode } from "../services/common";
import { DateTime } from "luxon";

export const VoteModes = {
  SINGLE_VOTE: "SINGLE_VOTE",
  DOLLAR_VOTE: "DOLLAR_VOTE",
} as const;

export type VoteMode = keyof typeof VoteModes;

export const RequestStatuses = {
  PENDING_APPROVAL: "PENDING_APPROVAL",
  APPROVED: "APPROVED",
} as const;

export type RequestStatus = keyof typeof RequestStatuses;

export const VoteStatuses = {
  OK: "OK",
  UNKNOWN_VOUCHER: "UnknownVoucher",
  INSUFFICIENT_FUNDS: "InsufficientFunds",
};

export type VoteStatus = keyof typeof VoteStatuses;

export interface SongRequest {
  requestedBy: User;
  song: { id: string; title: string };
  value: number;
  requestId: string;
  timestamp: DateTime;
  status: RequestStatus;
}

export interface SongRequests {
  page: SongRequest[];
}

export type GetSongRequests = () => Promise<ReturnOrError<SongRequests>>;

export interface VoteSubmission {
  requestId: string;
  status: VoteStatus;
  details: string;
}
