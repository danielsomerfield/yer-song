import axios, { Axios } from "axios";
import { createPost } from "../../http/serviceClient";
import { User } from "../../domain/users";
import { LoginResult, LoginResults } from "./loginDialog";
import { getToken, setToken } from "../../http/tokenStore";

interface Configuration {
  songsAPIHostURL: string;
}

export interface AdminService {
  removeFromPlaylist: (id: string) => Promise<void>;
  moveUpOnPlaylist: (id: string) => Promise<void>;
  moveDownOnPlaylist: (id: string) => Promise<void>;
  login: (username: string, password: string) => Promise<LoginResult>;
  lockSong: (id: string) => Promise<void>;
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
    return createPost<void>(
      configuration, `/lock/songs/${id}`,
      httpClient,
    )();
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

  return {
    removeFromPlaylist,
    moveUpOnPlaylist,
    moveDownOnPlaylist,
    login,
    lockSong,
  };
};
