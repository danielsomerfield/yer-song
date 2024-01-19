import { User, UserInput } from "../domain/user";
import {
  AttributeValue,
  DynamoDB,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
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
    return updateUser({ ...input, id });
  };

  const updateUser = async (user: User): Promise<User> => {
    const userRecord: Record<string, AttributeValue> = {
      PK: { S: user.id },
      SK: { S: user.id },
      // TODO: we might be able to get rid of the `name` fields since it's now in GSI1PK
      name: { S: user.name },
      GSI1PK: { S: user.name },
      entityType: { S: "user" },
      roles: {
        L:
          user.roles?.map((r) => {
            return {
              S: r,
            };
          }) || [],
      },
    };

    if (user.passwordHash) {
      userRecord.passwordHash = { S: user.passwordHash };
    }

    await client.putItem({
      TableName: tableName,
      Item: userRecord,
    });
    return user;
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
          passwordHash: item?.["passwordHash"]?.S,
        };
      }
    }
    return undefined;
  };

  return {
    insertUser,
    findUserByName,
    updateUser,
  };
};
