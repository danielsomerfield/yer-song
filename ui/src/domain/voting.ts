export const VoteModes = {
  SINGLE_VOTE: "SINGLE_VOTE",
  DOLLAR_VOTE: "DOLLAR_VOTE",
} as const;

export type VoteMode = keyof typeof VoteModes;

export interface VoteSubmission {
  requestId: string;
}
