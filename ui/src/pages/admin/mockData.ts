import { DateTime } from "luxon";
import { RequestStatuses } from "../../domain/voting";

export const users = {
  admin1: {
    id: "admin1",
    name: "Admin 1",
    roles: ["administrator"],
  },
  user1: {
    id: "user1",
    name: "User 1",
    roles: [],
  },
};

export const requests = {
  request1: {
    requestedBy: { id: users.user1.id, name: users.user1.name },
    song: {
      id: "song1",
      title: "Song 1",
    },
    requestId: "request1",
    value: 5,

    timestamp: DateTime.fromISO("2024-01-25T00:00:00Z"),
    status: RequestStatuses.PENDING_APPROVAL,
  },

  request2: {
    requestId: "request2",
    value: 5,
    requestedBy: { id: users.user1.id, name: users.user1.name },
    song: { title: "Song 2", id: "song2" },
    timestamp: DateTime.fromISO("2024-01-24T00:00:00Z"),
    status: RequestStatuses.PENDING_APPROVAL,
  },

  approvedRequest3: {
    song: {
      title: "Song 3",
      id: "song3",
    },
    requestId: "request3",
    value: 15,
    requestedBy: { id: users.user1.id, name: users.user1.name },

    timestamp: DateTime.fromISO("2024-01-24T00:00:00Z"),
    status: RequestStatuses.APPROVED,
  },
};
