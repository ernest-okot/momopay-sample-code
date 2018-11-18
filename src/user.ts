import axios from "axios";

export interface Secret {
  apiKey: string;
}

export function createSandboxUser(
  userId: string,
  host: string,
  key: string
): Promise<void> {
  return axios
    .post(
      "https://ericssonbasicapi2.azure-api.net/v1_0/apiuser",
      { providerCallbackHost: host },
      {
        headers: {
          "X-Reference-Id": userId,
          "Content-Type": "application/json",
          "Ocp-Apim-Subscription-Key": key
        }
      }
    )
    .then(response => response.data);
}

export function createApiSecret(userId: string, key: string): Promise<Secret> {
  return axios
    .post(
      `https://ericssonbasicapi2.azure-api.net/v1_0/apiuser/${userId}/apikey`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          "Ocp-Apim-Subscription-Key": key
        }
      }
    )
    .then(response => response.data);
}
