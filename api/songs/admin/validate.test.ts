import { describe, it } from "@jest/globals";
import { User } from "../domain/user";
import { createValidateAdminUser, Dependencies } from "./validate";
import * as bcrypt from "bcryptjs";
import resetAllMocks = jest.resetAllMocks;
import MockedFn = jest.MockedFn;
import fn = jest.fn;

describe("admin validation", () => {
  const adminUserPassword = "the pwd";

  const adminUser: User = {
    id: "user5",
    name: "User 5",
    roles: ["administrator"],
    passwordHash: bcrypt.hashSync(adminUserPassword, 12),
  };

  const noHashUser: User = {
    id: "user5",
    name: "User 5",
    roles: ["administrator"],
  };

  const noRolesUser: User = {
    id: "user6",
    name: "User 6",
    passwordHash: bcrypt.hashSync(adminUserPassword, 12),
  };

  const invalidHashUser: User = {
    id: "user5",
    name: "User 5",
    roles: ["administrator"],
    passwordHash: "not good",
  };

  const findUserByName: MockedFn<(name: string) => Promise<User | undefined>> =
    fn();

  const dependencies: Dependencies = {
    findUserByName,
  };

  beforeEach(async () => {
    resetAllMocks();
  });

  it("returns a user from a valid name and password", async () => {
    findUserByName.mockResolvedValue(adminUser);

    const validate = createValidateAdminUser(dependencies);
    const maybeUser = await validate(adminUser.name, adminUserPassword);
    expect(maybeUser).toBeDefined();
    expect(maybeUser).toMatchObject(adminUser);
  });

  it("returns undefined for an incorrect password", async () => {
    findUserByName.mockResolvedValue(adminUser);

    const validate = createValidateAdminUser(dependencies);
    const maybeUser = await validate(adminUser.name, "wrong!");
    expect(maybeUser).toBeUndefined();
  });

  it("returns undefined for a non-existent user", async () => {
    findUserByName.mockResolvedValue(undefined);

    const validate = createValidateAdminUser(dependencies);
    const maybeUser = await validate("wrong username", "");
    expect(maybeUser).toBeUndefined();
  });

  it("returns undefined for a user with no hash", async () => {
    findUserByName.mockResolvedValue(noHashUser);

    const validate = createValidateAdminUser(dependencies);
    const maybeUser = await validate("wrong username", "");
    expect(maybeUser).toBeUndefined();
  });

  it("returns undefined for a user with no roles", async () => {
    findUserByName.mockResolvedValue(noRolesUser);

    const validate = createValidateAdminUser(dependencies);
    const maybeUser = await validate("wrong username", "");
    expect(maybeUser).toBeUndefined();
  });

  it("returns undefined for a user with an invalid hash", async () => {
    findUserByName.mockResolvedValue(invalidHashUser);

    const validate = createValidateAdminUser(dependencies);
    const maybeUser = await validate("wrong username", "");
    expect(maybeUser).toBeUndefined();
  });
});
