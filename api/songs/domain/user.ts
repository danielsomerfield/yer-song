import { WithId } from "./WithId";

export interface UserInput {
  name: string;
  roles?: string[];
}
export type User = WithId<UserInput> & { passwordHash?: string };
