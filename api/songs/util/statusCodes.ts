// TODO: replace all the hard-coded status codes with this type

export const StatusCodes = {
  Error: "ERR",
  Ok: "OK",
  INVALID_INPUT: "InvalidInput",
} as const;

export type StatusCode = keyof typeof StatusCodes;
