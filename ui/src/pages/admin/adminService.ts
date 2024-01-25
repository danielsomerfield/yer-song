import axios, { Axios } from "axios";
import { createGetWithLoadStatus, createPost } from "../../http/serviceClient";
import { User } from "../../domain/users";
import { LoginResult, LoginResults } from "./loginDialog";
import { getToken, setToken } from "../../http/tokenStore";
import { RequestStatus, SongRequest, SongRequests } from "../../domain/voting";
import { ReturnOrError } from "../../services/common";
import { DateTime } from "luxon";

interface Configuration {
  songsAPIHostURL: string;
}

export interface AdminService {
  removeFromPlaylist: (id: string) => Promise<void>;
  moveUpOnPlaylist: (id: string) => Promise<void>;
  moveDownOnPlaylist: (id: string) => Promise<void>;
  login: (username: string, password: string) => Promise<LoginResult>;
  lockSong: (id: string) => Promise<void>;
  getSongRequests: () => Promise<ReturnOrError<SongRequests>>;
}

export const createAdminService = (
  configuration: Configuration,
  httpClient: Axios = axios,
  saveToken: (token: string) => void = setToken,
): AdminService => {
  const removeFromPlaylist = async (id: string) => {
    return createPost<void>(configuration, `/admin/${id}/remove`, httpClient)();
  };

  const moveUpOnPlaylist = async (id: string) => {
    return createPost<void>(configuration, `/admin/${id}/moveUp`, httpClient)();
  };
  const moveDownOnPlaylist = async (id: string) => {
    return createPost<void>(
      configuration,
      `/admin/${id}/moveDown`,
      httpClient,
    )();
  };
  const lockSong = async (id: string) => {
    return createPost<void>(configuration, `/lock/songs/${id}`, httpClient)();
  };

  interface LoginResponse {
    user?: User;
    token?: string;
  }

  const loginPost = createPost<LoginResponse>(
    configuration,
    "/admin/login",
    httpClient,
    getToken,
    () => {
      // TODO: this is either redundant or a potential bug
      console.log("Login failed");
    },
  );
  const login = async (
    username: string,
    password: string,
  ): Promise<LoginResult> => {
    const response = await loginPost({
      username,
      password,
    });

    const token = response?.token;
    if (token) {
      saveToken(token);
    }
    return token && response.user ? LoginResults.SUCCESS : LoginResults.FAILURE;
  };

  interface SongRequestJSON {
    requestedBy: User;
    song: { id: string; title: string };

    value: number;
    requestId: string;
    timestamp: string;
    status: string;
  }

  // TODO: clean this up and create a better way to validate and convert types on JSON payloads
  const getSongRequestsJSON = createGetWithLoadStatus<{
    page: SongRequestJSON[];
  }>(configuration, "/admin/songRequests", httpClient, getToken);

  const getSongRequests: () => Promise<
    ReturnOrError<SongRequests>
  > = async () => {
    const jsonResponse = await getSongRequestsJSON();

    //TODO: better validation on JSON structure
    if (jsonResponse.status == "OK") {
      const page: SongRequest[] =
        jsonResponse.value?.page?.map((r) => {
          return {
            ...r,
            status: r.status as RequestStatus,
            timestamp: DateTime.fromISO(r.timestamp),
          };
        }) || [];

      return {
        value: {
          page,
        },
        status: "OK",
      };
    } else {
      return {
        value: undefined,
        status: jsonResponse.status,
      };
    }
  };

  return {
    removeFromPlaylist,
    moveUpOnPlaylist,
    moveDownOnPlaylist,
    login,
    lockSong,
    getSongRequests,
  };
};
