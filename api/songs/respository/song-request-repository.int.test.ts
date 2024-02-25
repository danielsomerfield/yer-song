import { beforeEach, describe, it } from "@jest/globals";
import { afterEach } from "node:test";
import { Dynamo, startDynamo } from "./testutils";
import { createSongRequestRepository } from "./song-request-repository";
import { Songs, SongsWithRequests, Users } from "./sampledata";
import { DateTime } from "luxon";
import { Approval } from "../admin/approveSongRequest";
import { RequestStatuses } from "../admin/songRequests";

describe("The song request repository", () => {
  let dynamo: Dynamo;

  beforeEach(async () => {
    dynamo = await startDynamo();
    await dynamo.client().putItem(Songs.song1);
    await dynamo.client().putItem(Songs.song2);
    await dynamo.client().putItem(SongsWithRequests.song7);
    await dynamo.client().putItem(SongsWithRequests.song8);
  }, 60 * 1000);

  afterEach(async () => {
    await dynamo.stop();
  });

  const song1Id = Songs.song1.Item.SK.S;
  const voter1Id = Users.user1.M.id.S;
  const voter1Name = Users.user1.M.name.S;

  const song2Id = Songs.song2.Item.SK.S;

  const requestId = "request 1";
  const value = 800;

  const nowString = "2024-01-22T22:33:00Z";
  const now = DateTime.fromISO(nowString);

  it("stores new first song request in pending status", async () => {
    const repository = createSongRequestRepository(
      dynamo.client(),
      () => requestId,
      () => now
    );

    await repository.addSongRequest({
      songId: song1Id,
      voter: {
        id: voter1Id,
        name: voter1Name,
      },
      value,
    });

    const item = await dynamo.client().getItem({
      TableName: "song",
      Key: {
        PK: { S: song1Id },
        SK: { S: song1Id },
      },
    });

    expect(item.Item).toBeDefined();

    expect(item.Item).toMatchObject({
      PK: {
        S: song1Id,
      },
      SK: {
        S: song1Id,
      },
      GSI2PK: {
        S: "PENDING_APPROVAL",
      },
      voters: {
        L: [
          {
            M: {
              id: {
                S: voter1Id,
              },
              name: {
                S: voter1Name,
              },
            },
          },
        ],
      },
      requests: {
        M: {
          "request 1": {
            M: {
              id: {
                S: requestId,
              },
              voterId: {
                S: voter1Id,
              },
              voterName: {
                S: voter1Name,
              },
              status: {
                S: "PENDING_APPROVAL",
              },
              value: {
                N: "800",
              },
              timestamp: {
                S: nowString,
              },
            },
          },
        },
      },
    });
  });

  it("leaves the song in ON_PLAYLIST status", async () => {
    const repository = createSongRequestRepository(
      dynamo.client(),
      () => requestId,
      () => now
    );

    await repository.addSongRequest({
      songId: song2Id,
      voter: {
        id: voter1Id,
        name: voter1Name,
      },
      value,
    });

    const item = await dynamo.client().getItem({
      TableName: "song",
      Key: {
        PK: { S: song2Id },
        SK: { S: song2Id },
      },
    });

    expect(item.Item).toBeDefined();
    expect(item.Item).toMatchObject({
      PK: {
        S: song2Id,
      },
      SK: {
        S: song2Id,
      },
      GSI2PK: {
        S: "ON_PLAYLIST",
      },
      requests: {
        M: {
          "request 1": {
            M: {
              id: {
                S: requestId,
              },
              voterId: {
                S: voter1Id,
              },
              voterName: {
                S: voter1Name,
              },
              status: {
                S: "PENDING_APPROVAL",
              },
              value: {
                N: "800",
              },
              timestamp: {
                S: nowString,
              },
            },
          },
        },
      },
    });
  });

  it("fetches all song requests from songs", async () => {
    const repository = createSongRequestRepository(
      dynamo.client(),
      () => requestId,
      () => now
    );

    const requests = await repository.findAllSongRequests();
    expect(requests.page.length).toEqual(3);
    expect(requests.page.map((r) => r.id).sort()).toMatchObject(
      [
        SongsWithRequests.song7.Item.requests.M["Song7Request1"].M.id.S,
        SongsWithRequests.song7.Item.requests.M["Song7Request2"].M.id.S,
        SongsWithRequests.song8.Item.requests.M["Song8Request1"].M.id.S,
      ].sort()
    );
  });

  it("approves a request, adding it to the playlist with expected value", async () => {
    const repository = createSongRequestRepository(
      dynamo.client(),
      () => requestId,
      () => now
    );
    const requestToApproveId =
      SongsWithRequests.song7.Item.requests.M["Song7Request1"].M.id.S;
    const requestToApproveSongId = SongsWithRequests.song7.Item.PK.S;
    const valueToSet = 3;

    const approval: Approval = {
      requestId: requestToApproveId,
      songId: requestToApproveSongId,
      value: valueToSet,
    };
    await repository.approveSongRequest(approval);

    const requests = await repository.findAllSongRequests();
    const request = requests.page.find((r) => r.id == requestToApproveId);
    expect(request).toBeDefined();
    expect(request?.status).toEqual(RequestStatuses.APPROVED);

    const songId = request!.song.id;
    const songRecord = await dynamo.client().getItem({
      TableName: "song",
      Key: {
        PK: { S: songId },
        SK: { S: songId },
      },
    });
    expect(songRecord.Item?.["GSI2PK"].S).toEqual("ON_PLAYLIST");
    expect(songRecord.Item?.["voteCount"].N).toEqual(valueToSet.toString());
  });
});
