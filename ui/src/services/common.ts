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

// TODO: we could probably do some tricky typescript to make this so value is never null if StatusCode == OK.
export type ReturnOrError<T> = {
  value?: T;
  status: StatusCode;
};
