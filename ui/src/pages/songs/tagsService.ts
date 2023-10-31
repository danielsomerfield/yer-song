import axios, { Axios } from "axios";
import { createGet } from "../../http/serviceClient";

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
    return createGet<Tags>(
      configuration,
      `/tagName/${tagName}/tags`,
      httpClient,
    )();
  };
};
