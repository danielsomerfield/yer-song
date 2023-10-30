import { User, UserInput } from "../domain/user";
import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";

export const createUserRepository = (
  client: DynamoDB,
  idGen: () => string = () => uuidv4()
) => {
  const insertUser = async (input: UserInput): Promise<User> => {
    // TODO: make sure we don't get the same user twice

    const id = idGen();
    await client.putItem({
      TableName: "song",
      Item: {
        PK: { S: id },
        SK: { S: id },
        name: { S: input.name },
        entityType: { S: "user" },
      },
    });
    return { ...input, id };
  };

  return {
    insertUser,
  };
};
