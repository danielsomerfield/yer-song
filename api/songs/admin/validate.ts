import { User } from "../domain/user";
import * as bcrypt from "bcryptjs";

export interface Dependencies {
  findUserByName: (name: string) => Promise<User | undefined>;
}

export const createValidateAdminUser = (dependencies: Dependencies) => {
  const { findUserByName } = dependencies;
  return async (
    username: string,
    password: string
  ): Promise<User | undefined> => {
    const maybeUser = await findUserByName(username);
    if (
      maybeUser &&
      maybeUser.passwordHash &&
      maybeUser.roles?.find((r) => r == "administrator")
    ) {
      if (await bcrypt.compare(password, maybeUser.passwordHash)) {
        return maybeUser;
      }
    }
    return undefined;
  };
};
