import { createAdminLoginLambda } from "./adminLogin";
import { APIGatewayProxyEvent } from "aws-lambda";
import { User, UserInput } from "../domain/user";
import MockedFn = jest.MockedFn;
import fn = jest.fn;
import resetAllMocks = jest.resetAllMocks;

describe("the admin login", () => {
  const adminToken = "admin-token";
  const username = "adminUsername";
  const password = "adminPassword";
  const userId = "adminUserId";
  const adminRoles = ["administrator"];

  const notYetAdminUser: User = {
    id: userId,
    name: username,
    roles: undefined,
  };

  const legacyUser: User = {
    id: "legacyId",
    name: "legacyUsername",
    roles: undefined,
  };

  const validateCredentials: MockedFn<
    (username: string, password: string) => Promise<boolean>
  > = fn();
  const generateToken: MockedFn<(user: User) => Promise<string>> = fn();
  const insertUser: MockedFn<(user: UserInput) => Promise<User>> = fn();
  const getIdentityFromRequest: MockedFn<
    (event: APIGatewayProxyEvent) => User | undefined
  > = fn();

  const dependencies = {
    validateCredentials,
    generateToken,
    insertUser,
    getIdentityFromRequest,
  };

  beforeEach(() => {
    resetAllMocks();
  });

  describe("valid credentials", () => {
    it("logs in a new user who provide valid admin credentials", async () => {
      validateCredentials.mockResolvedValue(true);
      generateToken.mockResolvedValue(adminToken);
      insertUser.mockResolvedValue({
        id: userId,
        name: username,
      });
      getIdentityFromRequest.mockReturnValue(undefined);

      const adminLoginLambda = createAdminLoginLambda(dependencies);
      const event = {
        body: JSON.stringify({
          username,
          password,
        }),
      } as unknown as APIGatewayProxyEvent;

      const response = await adminLoginLambda(event);
      expect(response.statusCode).toEqual(200);
      expect(JSON.parse(response.body)).toMatchObject({
        user: {
          id: userId,
          name: username,
          roles: adminRoles,
        },
        token: adminToken,
      });

      expect(validateCredentials).toBeCalledWith(username, password);
      expect(generateToken).toBeCalledWith(
        expect.objectContaining({
          name: username,
          roles: expect.arrayContaining(adminRoles),
        })
      );
      expect(insertUser).toBeCalledWith(
        expect.objectContaining({ name: username })
      );
    });

    it("logs in a pre-existing user who provide valid admin credentials", async () => {
      // TODO: the fact that this works the same as the above is a bit of a smell. It's definitely
      //  worth digging into to see if it really makes sense to keep this way. It feels... wrong.
      validateCredentials.mockResolvedValue(true);
      generateToken.mockResolvedValue(adminToken);
      insertUser.mockResolvedValue({
        id: userId,
        name: username,
      });
      getIdentityFromRequest.mockReturnValue(notYetAdminUser);

      const adminLoginLambda = createAdminLoginLambda(dependencies);
      const event = {
        body: JSON.stringify({
          username,
          password,
        }),
      } as unknown as APIGatewayProxyEvent;

      const response = await adminLoginLambda(event);
      expect(response.statusCode).toEqual(200);
      expect(JSON.parse(response.body)).toMatchObject({
        user: {
          id: userId,
          name: username,
          roles: adminRoles,
        },
        token: adminToken,
      });

      expect(validateCredentials).toBeCalledWith(username, password);
      expect(generateToken).toBeCalledWith(
        expect.objectContaining({
          name: username,
          roles: expect.arrayContaining(adminRoles),
        })
      );
      // We are still going to call insertUser because it's technically an upsert
      //  and that should be fine as long as the username in the token matches that in the login attempt.
      //  We'll ensure that's the case on the client side, but if someone hacks it (or we miss a case), then
      //  we'll just deny admin login.
      expect(insertUser).toBeCalledWith(
        expect.objectContaining({ name: username })
      );
    });

    it("rejects the login of a pre-existing user if the request doesn't match their username", async () => {
      validateCredentials.mockResolvedValue(true);
      getIdentityFromRequest.mockReturnValue(legacyUser);

      const adminLoginLambda = createAdminLoginLambda(dependencies);
      const event = {
        body: JSON.stringify({
          username,
          password,
        }),
      } as unknown as APIGatewayProxyEvent;

      const response = await adminLoginLambda(event);
      expect(response.statusCode).toEqual(401);
      expect(insertUser).not.toBeCalled();
    });
  });

  describe("invalid credentials", () => {
    validateCredentials.mockResolvedValue(false);
    getIdentityFromRequest.mockReturnValue(undefined);
    it("denies new user with invalid credentials", async () => {
      const adminLoginLambda = createAdminLoginLambda(dependencies);
      const event = {
        body: JSON.stringify({
          username,
          password,
        }),
      } as unknown as APIGatewayProxyEvent;

      const response = await adminLoginLambda(event);
      expect(response.statusCode).toEqual(401);
      expect(JSON.parse(response.body).status).toEqual("ERR");
      expect(insertUser).not.toBeCalled();
    });
  });
});
