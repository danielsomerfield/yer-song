import { WithId } from "./WithId";

export interface UserInput {
  name: string;
}

export type User = WithId<UserInput>;
