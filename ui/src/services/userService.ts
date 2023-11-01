import axios, { Axios } from "axios";
import { Configuration } from "../configuration";
import { User, UserInput } from "../domain/users";
import { getToken } from "../http/tokenStore";
import { jwtDecode } from "jwt-decode";

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
    return response.data.data as UserRegistration;
  };
};

export const currentUser = (): User | undefined => {
  const token = getToken();
  // TODO: validate fields
  return token ? jwtDecode<User>(token) : undefined;
};

export type CurrentUser = typeof currentUser;
