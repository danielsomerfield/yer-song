export type WithId<T> = {
  [Property in keyof T]: T[Property];
} & { id: string };
