import axios, { Axios } from "axios";
import { createPost } from "../../http/serviceClient";

interface Configuration {
  songsAPIHostURL: string;
}

export interface AdminService {
  removeFromPlaylist: (id: string) => Promise<void>;
  moveUpOnPlaylist: (id: string) => Promise<void>;
  moveDownOnPlaylist: (id: string) => Promise<void>;
}

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

  return {
    removeFromPlaylist,
    moveUpOnPlaylist,
    moveDownOnPlaylist,
  };
};
