import axios, { Axios } from "axios";

interface Configuration {
  songsAPIHostURL: string;
}

export interface Tags {
  // thisPage: string;
  page: Tag[];
}

export interface Tag {
  name: string;
  value: string;
  id: string;
}

export const createGetTagsByName = (
  tagName: string,
  configuration: Configuration,
  httpClient: Axios = axios,
) => {
  return async (): Promise<Tags> => {
    const url = `${configuration.songsAPIHostURL}/tagName/${encodeURIComponent(
      tagName,
    )}/tags`;
    const response = await httpClient.get(url);

    // TODO: verify the object is structurally correct
    // TODO (MVP): verify the status code

    return response.data.data as Tags;
  };
};
