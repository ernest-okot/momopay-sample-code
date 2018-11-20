import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

import { Config } from ".";

import getTokenRefresher, { Authenticator, TokenRefresher } from "./oauth";
import { Subscription } from "./users";

export const baseURL = "https://ericssonbasicapi2.azure-api.net";

export function createClient(config: Subscription): AxiosInstance {
  return axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": config.subscriptionKey
    }
  });
}

export function withOAuth(
  config: Config,
  authenticator: Authenticator
): AxiosInstance {
  const instance = createClient(config);
  const refresh: TokenRefresher = getTokenRefresher(authenticator, config);

  instance.interceptors.request.use((request: AxiosRequestConfig) => {
    return refresh().then(({ accessToken }) => {
      return {
        ...request,
        headers: {
          ...request.headers,
          Authorization: `Bearer ${accessToken}`,
          "X-Target-Environment": "sandbox"
        }
      };
    });
  });

  return instance;
}
