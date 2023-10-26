import { describe, it } from "@jest/globals";
import { afterEach } from "node:test";
import { createTagsRepository } from "./tag-repository";
import { Dynamo, startDynamo } from "./testutils";

describe("The tag repository", () => {
  let dynamo: Dynamo;

  beforeEach(async () => {
    dynamo = await startDynamo();
    await dynamo.client().putItem({
      TableName: "song",
      Item: {
        PK: {
          S: "t:genre",
        },
        SK: {
          S: "t:genre:ClassicPopRock",
        },
        entityType: {
          S: "tag",
        },
        tag: {
          S: "genre:Classic Pop & Rock",
        },
      },
    });

    await dynamo.client().putItem({
      TableName: "song",
      Item: {
        PK: {
          S: "t:genre",
        },
        SK: {
          S: "t:genre:Contemporary",
        },
        entityType: {
          S: "tag",
        },
        tag: {
          S: "genre:Contemporary",
        },
      },
    });
  }, 60 * 1000);

  afterEach(async () => {
    await dynamo.stop();
  });

  it("loads tags based on their name", async () => {
    const tagsRepository = createTagsRepository(dynamo.client());
    const tags = await tagsRepository.getTagsByName("genre");
    expect(tags.length).toEqual(2);
    expect(tags.map((value) => value.name)).toEqual(["genre", "genre"]);
    expect(tags.map((value) => value.value)).toEqual([
      "Classic Pop & Rock",
      "Contemporary",
    ]);
  });
});
