import axios, { Axios } from "axios";
import { Configuration } from "../configuration";
import * as TokenStore from "./tokenStore";
import { error, ok, ReturnOrError, StatusCodes } from "../services/common";

axios.defaults.validateStatus = (status: number) => {
  return status < 500;
};

const getErrorForStatus = (status: number): ReturnOrError<never> => {
  if (status == 401) {
    return error(StatusCodes.REGISTRATION_REQUIRED);
  }

  if (status == 403) {
    return error(StatusCodes.INSUFFICIENT_PERMISSIONS);
  }

  return error(StatusCodes.UNKNOWN);
};

export const createGetWithLoadStatus = <T>(
  configuration: Configuration,
  path: string,
  httpClient: Axios = axios,
  getToken: () => string | null = TokenStore.getToken,
) => {
  return async (): Promise<ReturnOrError<T>> => {
    const url = `${configuration.songsAPIHostURL}/${path}`;
    const response = await httpClient.get(url, {
      headers: { "x-token": `Bearer ${getToken()}` },
    });

    const httpStatus = response.status;
    if (httpStatus == 200) {
      return ok(response.data.data);
    } else {
      return getErrorForStatus(httpStatus);
    }
  };
};

export const createGet = <T>(
  configuration: Configuration,
  path: string,
  httpClient: Axios = axios,
  getToken: () => string | null = TokenStore.getToken,
  httpStatusHandler: (status: number) => void = getErrorForStatus,
) => {
  return async (): Promise<T> => {
    const url = `${configuration.songsAPIHostURL}/${path}`;
    const response = await httpClient.get(url, {
      headers: { "x-token": `Bearer ${getToken()}` },
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
  httpStatusHandler: (status: number) => void = getErrorForStatus,
) => {
  return async (postData: unknown = {}) => {
    const url = `${configuration.songsAPIHostURL}${path}`;
    const response = await httpClient.post(url, postData, {
      headers: { "x-token": `Bearer ${getToken()}` },
    });
    if (response.status >= 400) {
      httpStatusHandler(response.status);
    }
    const data = response.data;
    return data.data as T;
  };
};
