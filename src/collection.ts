import axios from "axios";

export interface AccessToken {
  access_token: string;
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

export function createAccessToken(
  basicAuthToken: string,
  key: string
): Promise<AccessToken> {
  return axios
    .post(
      `https://ericssonbasicapi2.azure-api.net/colection/token/`,
      {},
      {
        headers: {
          Authorization: `Basic ${basicAuthToken}`,
          "Ocp-Apim-Subscription-Key": key
        }
      }
    )
    .then(response => {
      return response.data;
    });
}

export function requestToPay(
  paymentRequest: PaymentRequest,
  accessToken: string,
  referenceId: string,
  key: string
): Promise<void> {
  return axios
    .post<void>(
      `https://ericssonbasicapi2.azure-api.net/colection/v1_0/requesttopay`,
      paymentRequest,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Target-Environment": "sandbox",
          "X-Reference-Id": referenceId,
          "Ocp-Apim-Subscription-Key": key
        }
      }
    )
    .then(response => response.data);
}

export function getTransactionStatus(
  referenceId: string,
  accessToken: string,
  key: string
): Promise<TransactionStatus> {
  return axios
    .get(
      `https://ericssonbasicapi2.azure-api.net/colection/v1_0/requesttopay/${referenceId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Target-Environment": "sandbox",
          "Ocp-Apim-Subscription-Key": key
        }
      }
    )
    .then(response => response.data);
}

export function getAccountBalance(
  accessToken: string,
  key: string
): Promise<AccountBalance> {
  return axios
    .get(
      `https://ericssonbasicapi2.azure-api.net/colection/v1_0/account/balance`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "X-Target-Environment": "sandbox",
          "Ocp-Apim-Subscription-Key": key
        }
      }
    )
    .then(response => response.data);
}
