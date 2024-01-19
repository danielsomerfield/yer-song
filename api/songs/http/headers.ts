import { APIGatewayProxyEventHeaders } from "aws-lambda/trigger/api-gateway-proxy";
import { APIGatewayProxyResult } from "aws-lambda";
import { Maybe } from "../util/maybe";

export interface CORSEnabled {
  allowedOrigins: Set<string>;
}

export const getHeaderByName = (
  headers: APIGatewayProxyEventHeaders | undefined,
  name: string
): Maybe<string> => {
  const found = Object.entries(headers || {}).filter(
    (e) => name.toLowerCase() == e[0].toLowerCase()
  );
  if (found.length == 1) {
    return found[0][1];
  } else {
    return undefined;
  }
};

export const generateResponseHeaders = (
  requestHeaders: APIGatewayProxyEventHeaders,
  allowedOrigins: Set<string>,
  statusCode: number,
  body: unknown
) => {
  const originValues = Object.entries(requestHeaders || {})
    .filter((e) => e[0].toLowerCase() == "origin")
    .map((e) => e[1]);
  const originValue: string =
    originValues.length == 1 && originValues[0] ? originValues[0] : "";
  const allowed =
    originValue && allowedOrigins.has(originValue) ? originValue : "";
  return {
    statusCode: statusCode,
    headers: {
      "content-type": "application/json",
      "access-control-allow-headers": "Content-Type, Authorization",
      "access-control-allow-origin": allowed,
      "access-control-allow-methods": "GET, OPTIONS",
    },
    body: JSON.stringify(body),
  };
};

export const generateResponseHeadersForDataResponse = (
  data: unknown,
  requestHeaders: APIGatewayProxyEventHeaders,
  allowedOrigins: Set<string>,
  status = "OK"
): APIGatewayProxyResult => {
  const statusCode = 200;
  return generateResponseHeaders(requestHeaders, allowedOrigins, statusCode, {
    data,
    status,
  });
};
