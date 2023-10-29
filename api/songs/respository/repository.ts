import { AttributeValue } from "@aws-sdk/client-dynamodb";

export const getRequiredString = (
  item: Record<string, AttributeValue>,
  fieldName: string
): string => {
  const value = item?.[fieldName]?.S;
  if (!value) {
    throw {
      message: `Missing value for field: '${fieldName} in record ${JSON.stringify(
        item
      )}'.`,
    };
  } else {
    return value;
  }
};

export const getOptionalInt = (
  item: Record<string, AttributeValue>,
  fieldName: string
): number | undefined => {
  const value = item?.[fieldName]?.N;
  if (!value) {
    return undefined;
  } else {
    return Number.parseInt(value);
  }
};
