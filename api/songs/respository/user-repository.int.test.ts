import { describe, it } from "@jest/globals";
import { afterEach } from "node:test";
import { Dynamo, startDynamo } from "./testutils";
import { createUserRepository } from "./user-repository";

describe("The tag repository", () => {
  let dynamo: Dynamo;

  const userId = "u:user1";
  const name = "User 1";

  beforeEach(async () => {
    dynamo = await startDynamo();
  }, 60 * 1000);

  afterEach(async () => {
    await dynamo.stop();
  });

  it("loads tags based on their name", async () => {
    const tagsRepository = createUserRepository(dynamo.client(), () => userId);
    const user = await tagsRepository.insertUser({ name });
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
      entityType: { S: "user" },
    });
  });
});
