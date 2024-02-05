export const LoadStatusNames = [
  "uninitialized",
  "loading",
  "registration_required",
  "admin_required",
] as const;

export type LoadStatusName = (typeof LoadStatusNames)[number];

export interface NotLoadedStatus {
  data?: undefined;
  name: LoadStatusName;
}

export interface LoadedStatus<V> {
  data?: V;
  name: "loaded";
}

export type LoadStatus<V> = NotLoadedStatus | LoadedStatus<V>;

export const LoadStatuses = {
  UNINITIALIZED: { name: "uninitialized" },
  LOADING: { name: "loading" },
  REGISTRATION_REQUIRED: { name: "registration_required" },
  ADMIN_REQUIRED: { name: "admin_required" },
} as const;
