import { APIGatewayProxyEventHeaders } from "aws-lambda/trigger/api-gateway-proxy";
import { APIGatewayProxyResult } from "aws-lambda";

export interface CORSEnabled {
  allowedOrigins: Set<string>;
}

export const generateHeaders = (
  headers: APIGatewayProxyEventHeaders,
  allowedOrigins: Set<string>,
  statusCode: number,
  body: unknown
) => {
  const originValues = Object.entries(headers)
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
      "access-control-allow-headers": "Content-Type",
      "access-control-allow-origin": allowed,
      "access-control-allow-methods": "GET, OPTIONS",
    },
    body: JSON.stringify(body),
  };
};

export const generateHeadersForDataResponse = (
  data: unknown,
  headers: APIGatewayProxyEventHeaders,
  allowedOrigins: Set<string>,
  status = "OK"
): APIGatewayProxyResult => {
  const statusCode = 200;
  return generateHeaders(headers, allowedOrigins, statusCode, { data, status });
};
