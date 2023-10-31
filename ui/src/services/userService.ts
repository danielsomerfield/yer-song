import axios, { Axios } from "axios";
import { Configuration } from "../configuration";

export interface UserInput {
  name: string;
}

export interface User extends UserInput {
  id: string;
}

export interface UserRegistration {
  user: UserInput;
  token: string;
}

export type RegisterUser = (user: UserInput) => Promise<UserRegistration>;

export const createRegisterUser = (
  configuration: Configuration,
  httpClient: Axios = axios,
) => {
  return async (user: UserInput) => {
    const url = `${configuration.songsAPIHostURL}/users`;
    const response = await httpClient.post(url, user);
    console.log("data in service", response.data);
    return response.data.data as UserRegistration;
  };
};
