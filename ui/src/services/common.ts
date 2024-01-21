export const StatusCodes = {
  REGISTRATION_REQUIRED: "REGISTRATION_REQUIRED",
  UNKNOWN: "UNKNOWN",
  OK: "OK",
} as const;

export type StatusCode = keyof typeof StatusCodes;

export const ok = <T>(t: T): ReturnOrError<T> => {
  return {
    value: t,
    status: StatusCodes.OK,
  };
};

export const error = (status: StatusCode): ReturnOrError<never> => {
  return {
    status,
  };
};

export type ReturnOrError<T> = {
  value?: T;
  status: StatusCode;
};
