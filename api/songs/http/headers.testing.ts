import { APIGatewayProxyResult } from "aws-lambda";
import { expect } from "@jest/globals";

export const findHeaderByName = (
  result: APIGatewayProxyResult,
  name: string
): string => {
  const found = Object.entries(result.headers || {}).filter(
    (e) => name.toLowerCase() == e[0].toLowerCase()
  );
  if (found.length == 1) {
    return found[0][1].toString().toLowerCase();
  } else {
    throw `Expected one matching item, but found, ${found}`;
  }
};

export const supportsExpectedCORSMethods = (
  expectedMethods: string[],
  response: APIGatewayProxyResult
) => {
  expectedMethods.forEach((method) => {
    expect(
      findHeaderByName(response, "Access-Control-Allow-Methods")
        .split(",")
        .map((x) => x.trim())
    ).toContain(method);
  });
};

export const verifyCORSHeaders = (
  response: APIGatewayProxyResult,
  expectedOrigin: string
) => {
  expect(findHeaderByName(response, "Access-Control-Allow-Origin")).toEqual(
    expectedOrigin
  );
  const expectedMethods = ["options", "get"];
  supportsExpectedCORSMethods(expectedMethods, response);
};
