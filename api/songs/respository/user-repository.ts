import { User, UserInput } from "../domain/user";
import { DynamoDB, QueryCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { getRequiredString } from "./repository";

const tableName = "song";

export const createUserRepository = (
  client: DynamoDB,
  idGen: () => string = () => uuidv4()
) => {
  const insertUser = async (input: UserInput): Promise<User> => {
    // TODO: make sure we don't get the same user twice

    const id = `u:${idGen()}`;
    await client.putItem({
      TableName: tableName,
      Item: {
        PK: { S: id },
        SK: { S: id },
        // TODO: we might be able to get rid of the `name` fields since it's now in GSI1PK
        name: { S: input.name },
        GSI1PK: { S: input.name },
        entityType: { S: "user" },
      },
    });
    return { ...input, id };
  };

  const findUserByName = async (name: string): Promise<User | undefined> => {
    // TODO: we're going a little heavy handed here and it might be better
    //  to have a secondary index. Monitor this for a bit and see what the scanning cost looks like...
    const maybeUserResponse = await client.send(
      new QueryCommand({
        TableName: "song",
        IndexName: "GSI1",
        KeyConditionExpression: "GSI1PK = :pk AND begins_with(SK, :sk)",
        ExpressionAttributeValues: {
          ":pk": {
            S: name,
          },
          ":sk": {
            S: "u:",
          },
        },
      })
    );

    if (maybeUserResponse.Count != 0) {
      const item = maybeUserResponse.Items?.[0];
      if (item) {
        return {
          id: getRequiredString(item, "PK"),
          name: getRequiredString(item, "GSI1PK"),
          roles:
            item?.["roles"]?.L?.map((r) => r.S || "").filter((s) => s != "") ||
            [],
          passwordHash: item?.["passwordHash"].S,
        };
      }
    }
    return undefined;
  };

  return {
    insertUser,
    findUserByName,
  };
};
