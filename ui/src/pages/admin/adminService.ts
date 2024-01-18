import axios, { Axios } from "axios";
import { createPost } from "../../http/serviceClient";
import { User } from "../../domain/users";

interface Configuration {
  songsAPIHostURL: string;
}

export interface AdminService {
  removeFromPlaylist: (id: string) => Promise<void>;
  moveUpOnPlaylist: (id: string) => Promise<void>;
  moveDownOnPlaylist: (id: string) => Promise<void>;
  login: (username: string, password: string) => Promise<LoginResult>;
}

export const LoginResults = {
  SUCCESS: "SUCCESS",
  FAILURE: "FAILURE",
} as const;

export type LoginResult = keyof typeof LoginResults;

export const createAdminService = (
  configuration: Configuration,
  httpClient: Axios = axios,
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

  interface LoginResponse {
    user?: User;
    token?: string;
  }

  const loginPost = createPost<LoginResponse>(
    configuration,
    "/admin/login",
    httpClient,
  );
  const login = async (
    username: string,
    password: string,
  ): Promise<LoginResult> => {
    const response = await loginPost({
      username,
      password,
    });

    return response.user ? LoginResults.SUCCESS : LoginResults.FAILURE;
  };

  return {
    removeFromPlaylist,
    moveUpOnPlaylist,
    moveDownOnPlaylist,
    login,
  };
};
