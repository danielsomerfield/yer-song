import axios, { Axios } from "axios";
import { Configuration } from "../configuration";
import * as TokenStore from "./tokenStore";
import { Navigate, redirect } from "react-router-dom";

axios.defaults.validateStatus = (status: number) => {
  return status < 500;
};

const defaultStatusHandler = (status: number) => {
  // TODO: factor this out and change to useNavigate
  if (status == 401) {
    window.location.href = "/";
  }
};
export const createGet = <T>(
  configuration: Configuration,
  path: string,
  httpClient: Axios = axios,
  getToken: () => string | null = TokenStore.getToken,
  httpStatusHandler: (status: number) => void = defaultStatusHandler,
) => {
  return async (): Promise<T> => {
    const url = `${configuration.songsAPIHostURL}/${path}`;
    const response = await httpClient.get(url, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });

    if (response.status >= 400) {
      httpStatusHandler(response.status);
    }
    const data = response.data;
    return data.data as T;
  };
};

export const createPost = <T>(
  configuration: Configuration,
  path: string,
  httpClient: Axios = axios,
  getToken: () => string | null = TokenStore.getToken,
  httpStatusHandler: (status: number) => void = defaultStatusHandler,
) => {
  return async () => {
    const url = `${configuration.songsAPIHostURL}/${path}`;
    const response = await httpClient.post(
      url,
      {},
      {
        headers: { Authorization: `Bearer ${getToken()}` },
      },
    );
    if (response.status >= 400) {
      httpStatusHandler(response.status);
    }
    const data = response.data;
    return data.data as T;
  };
};
