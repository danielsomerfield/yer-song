// TODO: replace all the hard-coded status codes with this type

export const StatusCodes = {
  Error: "ERR",
  Ok: "OK",
  INVALID_INPUT: "InvalidInput",
  UNKNOWN_VOUCHER: "UnknownVoucher",
  INSUFFICIENT_FUNDS: "InsufficientFunds",
  UNEXPECTED_ERROR: "UnexpectedError",
} as const;

export type StatusCode = (typeof StatusCodes)[keyof typeof StatusCodes];
export type StatusCodeNames = [StatusCode];
