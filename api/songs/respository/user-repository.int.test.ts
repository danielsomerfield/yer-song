import { describe, it } from "@jest/globals";
import { afterEach } from "node:test";
import { Dynamo, startDynamo } from "./testutils";
import { createUserRepository } from "./user-repository";
import { User } from "../domain/user";
import * as bcrypt from "bcrypt";

describe("The user repository", () => {
  let dynamo: Dynamo;

  const userIdSuffix = "user1";
  const userId = `u:${userIdSuffix}`;

  const name = "User 1";

  const adminUserIdSuffix = "user5";
  const adminUser: User = {
    id: `u:${adminUserIdSuffix}`,
    name: "User 5",
    roles: ["administrator"],
  };

  const adminUserPassword = "the pwd";

  beforeEach(async () => {
    dynamo = await startDynamo();
  }, 60 * 1000);

  afterEach(async () => {
    await dynamo.stop();
  });

  it("saves users in the db", async () => {
    const userRepository = createUserRepository(
      dynamo.client(),
      () => userIdSuffix
    );
    const user = await userRepository.insertUser({ name });
    expect(user).toBeDefined();
    expect(user).toMatchObject({
      id: userId,
      name,
    });

    const savedUser = await dynamo.client().getItem({
      TableName: "song",
      Key: {
        PK: {
          S: userId,
        },
        SK: {
          S: userId,
        },
      },
    });

    expect(savedUser.Item).toBeDefined();
    expect(savedUser.Item).toMatchObject({
      PK: {
        S: userId,
      },
      SK: {
        S: userId,
      },
      name: { S: name },
      GSI1PK: { S: name },
      entityType: { S: "user" },
    });
  });

  it("loads users by name", async () => {
    await createUser(adminUser, adminUserPassword);
    const userRepository = createUserRepository(
      dynamo.client(),
      () => userIdSuffix
    );

    const maybeUser = await userRepository.findUserByName(adminUser.name);
    expect(maybeUser).toBeDefined();
    expect(maybeUser).toMatchObject({
      id: `${adminUser.id}`,
      name: adminUser.name,
      roles: ["administrator"],
    });
    expect(maybeUser?.passwordHash).toBeDefined();
    expect(
      await bcrypt.compare(adminUserPassword, maybeUser?.passwordHash || "")
    ).toEqual(true);
  });

  const createUser = async (user: User, password: string) =>
    dynamo.client().putItem({
      TableName: "song",
      Item: {
        PK: { S: `${user.id}` },
        SK: { S: `${user.id}` },
        GSI1PK: { S: user.name },
        name: { S: user.name },
        roles: {
          L:
            user?.roles?.map((r) => {
              return { S: r };
            }) || [],
        },
        entityType: { S: "user" },
        passwordHash: { S: await bcrypt.hash(password, 12) },
      },
    });
});
