import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { generateResponseHeaders } from "../http/headers";

export interface Dependencies {
    insertLock(id: string): Promise<void>;
    allowedOrigins: Set<string>;
}

export const createLockSongLambda = (dependencies: Dependencies) => {
    return async (
        event: APIGatewayProxyEvent
    ): Promise<APIGatewayProxyResult> => {
        const { insertLock, allowedOrigins } = dependencies;
        const songId = event.pathParameters?.["songId"];

        if (songId) {
            await insertLock(songId);
            return generateResponseHeaders(event.headers,allowedOrigins, 200, {
                status: "Ok",
            });
        } else {
            return {
                statusCode: 404,
                headers: {
                    "content-type": "application/json",
                },
                body: '{"message":"Missing id"}',
            };
        }
    };
};