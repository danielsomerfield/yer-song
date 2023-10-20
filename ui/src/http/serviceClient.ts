import axios, { Axios } from "axios";

export const createGetForId = <T>(
  requestPath: string,
  httpClient: Axios = axios,
) => {
  return async (id: string): Promise<T | undefined> => {
    const url = `${requestPath}/${id}`;
    const response = await httpClient.get(url);

    //TODO: verify the object is structurally correct
    //TODO: verify the status code

    return response.data.data as T;
  };
};
