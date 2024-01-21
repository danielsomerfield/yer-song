import axios, { Axios } from "axios";
import { createGet, createGetWithLoadStatus } from "../../http/serviceClient";
import { ReturnOrError } from "../../services/common";

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
  return async (): Promise<ReturnOrError<Tags>> => {
    return createGetWithLoadStatus<Tags>(
      configuration,
      `/tagName/${tagName}/tags`,
      httpClient,
    )();
  };
};
