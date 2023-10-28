import { AttributeValue } from "@aws-sdk/client-dynamodb";

export const getRequiredString = (
  item: Record<string, AttributeValue>,
  fieldName: string
): string => {
  const value = item?.[fieldName]?.S;
  if (!value) {
    throw { message: `Missing value for field: '${fieldName}'.` };
  } else {
    return value;
  }
};