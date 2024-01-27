import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { APIGatewayProxyEvent } from "aws-lambda";
import * as UnlockSong from "./unlockSong";
import MockedFunction = jest.MockedFunction;


describe("unlock a locked song", () => {
    const clearLock: MockedFunction<(id: string) => Promise<void>> = jest.fn();
    
    const dependencies = {
        clearLock,
        allowedOrigins: new Set(""),
    };

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("unlocks a locked song", async () => {
        const songId = "s:1234321";

        const event = {
            pathParameters: { songId },
            headers: { origin: "" },
        } as unknown as APIGatewayProxyEvent;

        const unlockSong = UnlockSong.createClearLockSongLambda(dependencies);
        const result = await unlockSong(event);
        const statusMessage = JSON.parse(result.body);

        expect(clearLock).toHaveBeenCalledTimes(1);
        expect(clearLock).toHaveBeenCalledWith(songId);
        expect(result.statusCode).toEqual(200);
        expect(statusMessage).toMatchObject({
            status: "Ok",
        });
    });

    it("returns 404 with non-existing id", async () => {
        const event = {
            pathParameters: { undefined },
            headers: { origin: "" },
        } as unknown as APIGatewayProxyEvent;

        const unlockSong = UnlockSong.createClearLockSongLambda(dependencies);
        const result = await unlockSong(event);
        
        expect(clearLock).not.toHaveBeenCalled;
        expect(result.statusCode).toEqual(404);
    });
});