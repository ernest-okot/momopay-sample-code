import { AxiosInstance } from "axios";
import moment from "moment";
import uuid from "uuid/v4";

import { Config } from ".";
import { createBasicAuthToken, OAuthCredentials } from "./oauth";
import { createClient, withOAuth } from "./client";

export interface AccessToken {
  access_token: string;
  token_type: "string";
  expires_in: 3600;
}

export interface Payer {
  partyIdType: "MSISDN" | string;
  partyId: string;
}

export interface PaymentRequest {
  amount: string;
  currency: string;
  externalId: string;
  payer: Payer;
  payerMessage: string;
  payeeNote: string;
}

export interface TransactionStatus {
  financialTransactionId: string;
  externalId: string;
  amount: string;
  currency: string;
  payer: Payer;
  payerMessage: string;
  payeeNote: string;
  status: "SUCCESSFUL" | string;
}

export interface AccountBalance {
  availableBalance: string;
  currency: string;
}

export default class Collections {
  private client: AxiosInstance;

  public static authorize(config: Config): Promise<OAuthCredentials> {
    const basicAuthToken: string = createBasicAuthToken(config);
    return createClient(config)
      .post<AccessToken>("/colection/token/", null, {
        headers: {
          Authorization: `Basic ${basicAuthToken}`
        }
      })
      .then(response => {
        const data = response.data;
        console.log({ data });
        return {
          accessToken: data.access_token,
          expires: moment()
            .add(data.expires_in, "seconds")
            .toDate()
        };
      });
  }

  constructor(config: Config) {
    this.client = withOAuth(config, Collections.authorize);
  }

  public requestToPay(paymentRequest: PaymentRequest): Promise<string> {
    const referenceId: string = uuid();
    return this.client
      .post<void>("/colection/v1_0/requesttopay", paymentRequest, {
        headers: {
          "X-Reference-Id": referenceId
        }
      })
      .then(() => referenceId);
  }

  public getTransactionStatus(referenceId: string): Promise<TransactionStatus> {
    return this.client
      .get(`/colection/v1_0/requesttopay/${referenceId}`)
      .then(response => response.data);
  }

  public getAccountBalance(): Promise<AccountBalance> {
    return this.client
      .get("/colection/v1_0/account/balance")
      .then(response => response.data);
  }
}
