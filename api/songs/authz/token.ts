import * as jwt from "jsonwebtoken";
import { User } from "../domain/user";

interface Dependencies {
  secret: string;
}

export const createGenerateToken = (dependencies: Dependencies) => {
  return async (user: User) => {
    const { secret } = dependencies;

    return jwt.sign(user, secret, { algorithm: "HS256" });
  };
};
