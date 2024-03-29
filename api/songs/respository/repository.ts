import { AttributeValue } from "@aws-sdk/client-dynamodb";

export const getStringOrDefault = (
  item: Record<string, AttributeValue>,
  fieldName: string,
  defaultValue: string
) => {
  const value = item?.[fieldName]?.S;
  if (!value) {
    return defaultValue;
  } else {
    return value;
  }
};

export const getRequiredString = (
  item: Record<string, AttributeValue>,
  fieldName: string
): string => {
  const value = item?.[fieldName]?.S;
  if (!value) {
    throw {
      message: `Missing value for field: '${fieldName}' in record ${JSON.stringify(
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

export const getRequiredInt = (
  item: Record<string, AttributeValue>,
  fieldName: string
): number => {
  const value = item?.[fieldName]?.N;
  if (!value) {
    throw {
      message: `Missing value for field: '${fieldName}' in record ${JSON.stringify(
        item
      )}'.`,
    };
  } else {
    return Number.parseInt(value);
  }
};
