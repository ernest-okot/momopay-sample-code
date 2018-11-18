import uuid from "uuid/v4";
import Promise from "bluebird";
import {
  createSandboxUser,
  createApiSecret,
  createAccessToken,
  requestToPay,
  getTransactionStatus,
  getAccountBalance,
  PaymentRequest
} from ".";

function runSandboxCollectionsExample(host: string, primaryKey: string) {
  const apiUserId = uuid();
  return Promise.resolve()
    .then(() => {
      console.log("STEP 1: Create a user account for your apiUserId");
      return createSandboxUser(apiUserId, host, primaryKey);
    })
    .then(() => {
      console.log("STEP 2: Get an API Secret (Only for sandbox)");
      return createApiSecret(apiUserId, primaryKey);
    })
    .tap(secret => console.log({ secret }))
    .then(apiSecret => {
      console.log("STEP 3: Create a basic auth token");
      return Buffer.from(`${apiUserId}:${apiSecret.apiKey}`).toString("base64");
    })
    .tap(basicAuthToken => console.log({ basicAuthToken }))
    .then(basicAuthToken => {
      console.log("STEP 4: Get Bearer token");
      return createAccessToken(basicAuthToken, primaryKey).then(
        accessToken => accessToken.access_token
      );
    })
    .tap(accessToken => console.log({ accessToken }))
    .then(accessToken => {
      const ref = uuid();
      return Promise.resolve()
        .then(() => {
          console.log("STEP 5: request to pay");
          const paymentRequest: PaymentRequest = {
            amount: "50",
            currency: "EUR",
            externalId: "123456",
            payer: {
              partyIdType: "MSISDN",
              partyId: "256774290781"
            },
            payerMessage: "testing",
            payeeNote: "hello"
          };
          return requestToPay(paymentRequest, accessToken, ref, primaryKey);
        })
        .tap(requestToPay => console.log({ requestToPay }))
        .then(() => {
          console.log("STEP 6: Check transaction status");
          return getTransactionStatus(ref, accessToken, primaryKey);
        })
        .tap(status => console.log({ status }))
        .then(() => {
          console.log("STEP 6: Check balance");
          return getAccountBalance(accessToken, primaryKey);
        })
        .tap(balance => console.log({ balance }));
    })
    .catch(error =>
      console.error(
        error.message,
        error.response && error.response.data,
        error.response && error.response.config
      )
    );
}

const host: string = process.env.HOST || "";
const primaryKey: string = process.env.PRIMARY_KEY || "";

runSandboxCollectionsExample(host, primaryKey);
