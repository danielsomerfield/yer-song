import { createGetSongLambda } from "./song/getSong";
import { createGetTagsByNameLambda } from "./tags/getTags";
import { createGetSongsByTagIdLambda } from "./songs/getSongs";
import { createGetPlaylist } from "./playlist/playlist";
import { createVoteForSongLambda } from "./song/voteForSong";
import { createRegisterUserLambda } from "./user/registration";
import { getAppDependencies } from "./inject";
import { createRunAdminCommandLambda } from "./admin/runAdminCommand";

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
  createVoteForSongLambda(getAppDependencies())
);

export const runAdminCommand = auth().requireAdmin(
  createRunAdminCommandLambda(getAppDependencies())
);

export const registerUser = createRegisterUserLambda(getAppDependencies());
