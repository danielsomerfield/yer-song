import { createAdminLoginLambda } from "./adminLogin";
import MockedFn = jest.MockedFn;
import fn = jest.fn;

describe("the admin login", () => {
  it("logs in users who provide the right credentials", () => {
    const validateCredentials: MockedFn<
      (username: string, password: string) => boolean
    > = fn();
    const dependencies = {
      validateCredentials,
    };
    const lambda = createAdminLoginLambda(dependencies);
  });
});
