import { WithId } from "./WithId";

export interface UserInput {
  name: string;
  roles?: string[];
  passwordHash?: string;
}
export type User = WithId<UserInput>;
