import { User } from "../domain/user";

export interface Dependencies {
  findUserByName: (name: string) => User | undefined;
}

export const createValidate = (dependencies: Dependencies) => {
  return (username: string, password: string): User | undefined => {
    return undefined;
  };
};
