import { WithId } from "./WithId";

export interface UserInput {
  name: string;
  // TODO: this isn't used in the repo right now and should be migrated to `User`
  roles?: string[];
}

export type User = WithId<UserInput>;
