import { createAdminLoginLambda } from "./adminLogin";
import { APIGatewayProxyEvent } from "aws-lambda";
import { User } from "../domain/user";
import { StatusCodes } from "../util/statusCodes";
import MockedFn = jest.MockedFn;
import fn = jest.fn;
import resetAllMocks = jest.resetAllMocks;

describe("the admin login", () => {
  const adminToken = "admin-token";
  const name = "adminUsername";
  const password = "adminPassword";
  const userId = "adminUserId";
  const adminRoles = ["administrator"];

  const validAdmin: User = {
    id: userId,
    name,
    roles: ["administrator"],
  };

  const validNonAdmin: User = {
    id: userId,
    name,
  };

  const validateCredentials: MockedFn<
    (username: string, password: string) => Promise<User | undefined>
  > = fn();
  const generateToken: MockedFn<(user: User) => Promise<string>> = fn();

  const dependencies = {
    validateCredentials,
    generateToken,
  };

  beforeEach(() => {
    resetAllMocks();
  });

  it("logs in a user with valid admin credentials", async () => {
    generateToken.mockResolvedValue(adminToken);
    validateCredentials.mockResolvedValue(validAdmin);

    const adminLoginLambda = createAdminLoginLambda(dependencies);
    const event = {
      body: JSON.stringify({
        username: name,
        password,
      }),
    } as unknown as APIGatewayProxyEvent;

    const response = await adminLoginLambda(event);
    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body)).toMatchObject({
      data: {
        user: {
          id: userId,
          name: name,
          roles: adminRoles,
        },
        token: adminToken,
      },
    });

    expect(validateCredentials).toBeCalledWith(name, password);
    expect(generateToken).toBeCalledWith(
      expect.objectContaining({
        name: name,
        roles: expect.arrayContaining(adminRoles),
      })
    );
  });

  it("denies user with invalid credentials", async () => {
    validateCredentials.mockResolvedValue(undefined);

    const adminLoginLambda = createAdminLoginLambda(dependencies);
    const event = {
      body: JSON.stringify({
        username: name,
        password,
      }),
    } as unknown as APIGatewayProxyEvent;

    const response = await adminLoginLambda(event);
    expect(response.statusCode).toEqual(401);
    expect(JSON.parse(response.body).status).toEqual(StatusCodes.Error);
  });

  it("denies user without admin role", async () => {
    validateCredentials.mockResolvedValue(validNonAdmin);

    const adminLoginLambda = createAdminLoginLambda(dependencies);
    const event = {
      body: JSON.stringify({
        username: name,
        password,
      }),
    } as unknown as APIGatewayProxyEvent;

    const response = await adminLoginLambda(event);
    expect(response.statusCode).toEqual(403);
    expect(JSON.parse(response.body).status).toEqual(StatusCodes.Error);
  });
});
