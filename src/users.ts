import { AxiosInstance } from "axios";
import uuid from "uuid/v4";

import { createClient } from "./client";

export interface Subscription {
  subscriptionKey: string;
}

export interface Credentials {
  apiKey: string;
}

export default class Users {
  client: AxiosInstance;

  constructor(config: Subscription) {
    this.client = createClient(config);
  }

  public create(host: string): Promise<string> {
    const userId: string = uuid();
    return this.client
      .post(
        "/v1_0/apiuser",
        { providerCallbackHost: host },
        {
          headers: {
            "X-Reference-Id": userId
          }
        }
      )
      .then(() => userId);
  }

  public login(userId: string): Promise<Credentials> {
    return this.client
      .post<Credentials>(`v1_0/apiuser/${userId}/apikey`)
      .then(response => response.data);
  }
}
