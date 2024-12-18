import { createGetSongLambda } from "./song/getSong";
import { createGetTagsByNameLambda } from "./tags/getTags";
import { createGetSongsByTagIdLambda } from "./songs/getSongs";
import { createGetPlaylist } from "./playlist/playlist";
import { createLockSongLambda } from "./song/lockSong";
import { createRegisterUserLambda } from "./user/registration";
import { getAppDependencies } from "./inject";
import { createRunAdminCommandLambda } from "./admin/runAdminCommand";
import { createAdminLoginLambda } from "./admin/adminLogin";
import { createGetSongRequestsLambda } from "./admin/songRequests";
import { createApproveSongRequest } from "./admin/approveSongRequest";
import { createClearLockSongLambda } from "./song/unlockSong";
import { createDenySongRequest } from "./admin/denySongRequest";
import { createDollarVoteModeLambda } from "./song/dollarVoteLambda";

const auth = () => {
  return getAppDependencies().authRules;
};

export const getSong = auth().requireUser(
  createGetSongLambda(getAppDependencies())
);

export const getTags = auth().requireUser(
  createGetTagsByNameLambda(getAppDependencies())
);

export const getSongsByTagId = auth().requireUser(
  createGetSongsByTagIdLambda(getAppDependencies())
);

export const getPlaylist = auth().requireUser(
  createGetPlaylist(getAppDependencies())
);

export const voteForSong = auth().requireUser(
  createDollarVoteModeLambda(getAppDependencies())
);

export const lockSong = auth().requireAdmin(
  createLockSongLambda(getAppDependencies())
);

export const runAdminCommand = auth().requireAdmin(
  createRunAdminCommandLambda(getAppDependencies())
);

export const adminLogin = createAdminLoginLambda(getAppDependencies());

export const registerUser = createRegisterUserLambda(getAppDependencies());

export const getSongRequests = auth().requireAdmin(
  createGetSongRequestsLambda(getAppDependencies())
);

export const approveSongRequest = auth().requireAdmin(
  createApproveSongRequest(getAppDependencies())
);

export const clearLock = auth().requireAdmin(
  createClearLockSongLambda(getAppDependencies())
);

export const denySongRequest = auth().requireAdmin(
  createDenySongRequest(getAppDependencies())
);
