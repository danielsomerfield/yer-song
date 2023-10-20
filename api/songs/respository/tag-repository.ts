import { DynamoDB } from "@aws-sdk/client-dynamodb";
import { Tag } from "../domain/tags";
import { logger } from "../util/logger";
import { getRequiredString } from "./repository";

export const createTagsRepository = (dynamoDB: DynamoDB) => {
  return {
    getTagsByName: async (name: string): Promise<Tag[]> => {
      try {
        const result = await dynamoDB.query({
          TableName: "song",
          ProjectionExpression: "PK, SK, tag",
          KeyConditionExpression: "PK = :pk",
          ExpressionAttributeValues: {
            ":pk": {
              S: `t:${name}`,
            },
          },
        });

        const items = result.Items?.map((item) => {
          const tagString = getRequiredString(item, "tag");
          const groups = tagString.match(
            /^(?<name>.*):(?<value>.*).*$/
          )?.groups;
          if (groups) {
            return {
              id: getRequiredString(item, "SK"),
              name: groups.name,
              value: groups.value,
            };
          } else {
            // Bad record. Filter it out and log.
            // TODO: add metric
            logger.warn(tagString, "Malformed tag");
            return undefined;
          }
        });
        return (items?.filter((i) => i != undefined) as Tag[]) || [];
      } catch (e) {
        // TODO: get rid of this and catch above
        logger.error(e);
        throw e;
      }
    },
  };
};
