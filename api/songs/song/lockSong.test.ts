import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { APIGatewayProxyEvent } from "aws-lambda";
import * as LockSong from "./lockSong";
import MockedFunction = jest.MockedFunction;


describe("add lock to song", () => {
    const insertLock: MockedFunction<(id: string) => Promise<void>> = jest.fn();
    
    const dependencies = {
        insertLock,
        allowedOrigins: new Set(""),
    };

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("adds the lock for the song", async () => {
        const songId = "s:1234321";

        const event = {
            pathParameters: { songId },
            headers: { origin: "" },
        } as unknown as APIGatewayProxyEvent;

        const lockSong = LockSong.createLockSongLambda(dependencies);
        const result = await lockSong(event);
        const statusMessage = JSON.parse(result.body);

        expect(insertLock).toHaveBeenCalledTimes(1);
        expect(insertLock).toHaveBeenCalledWith(songId);
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

        const lockSong = LockSong.createLockSongLambda(dependencies);
        const result = await lockSong(event);
        
        expect(insertLock).not.toHaveBeenCalled;
        expect(result.statusCode).toEqual(404);
    });
});