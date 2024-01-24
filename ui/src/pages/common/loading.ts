export interface LoadStatus<T> {
  data?: T;
  name: string;
}

export const LoadStatuses = {
  UNINITIALIZED: { name: "uninitialized" },
  LOADING: { name: "loading" },
  REGISTRATION_REQUIRED: { name: "registration_required" },
  ADMIN_REQUIRED: { name: "registration_required" },
} as const;
