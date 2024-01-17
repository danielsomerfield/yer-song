import { describe, it } from "@jest/globals";
import { User } from "../domain/user";
import { createValidate, Dependencies } from "./validate";
import resetAllMocks = jest.resetAllMocks;
import MockedFn = jest.MockedFn;
import fn = jest.fn;

describe("admin validation", () => {
  const adminUser: User = {
    id: "user5",
    name: "User 5",
    roles: ["administrator"],
  };

  const adminUserPassword = "the pwd";

  const findUserByName: MockedFn<(name: string) => User | undefined> = fn();

  const dependencies: Dependencies = {
    findUserByName,
  };

  beforeEach(async () => {
    resetAllMocks();
  });

  xit("returns a user from a valid name and password", () => {
    const validate = createValidate(dependencies);
    const maybeUser = validate(adminUser.name, adminUserPassword);
    expect(maybeUser).toBeDefined();
    expect(maybeUser).toMatchObject(adminUser);
  });

  it("returns undefined for a mismatch", () => {
    const validate = createValidate(dependencies);
    const maybeUser = validate(adminUser.name, "wrong!");
    expect(maybeUser).toBeUndefined();
  });
});
