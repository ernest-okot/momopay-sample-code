const uuid = require("uuid/v4");
const axios = require("axios");
const Promise = require("bluebird");

function getToken(host, key) {
  const apiUserId = uuid();
  return Promise.resolve()
    .then(() => {
      // Only for sandbox
      return axios.post(
        "https://ericssonbasicapi2.azure-api.net/v1_0/apiuser",
        { providerCallbackHost: host },
        {
          headers: {
            "X-Reference-Id": apiUserId,
            "Content-Type": "application/json",
            "Ocp-Apim-Subscription-Key": key
          }
        }
      );
    })
    .then(() => {
      // Get API Secret
      return axios
        .post(
          `https://ericssonbasicapi2.azure-api.net/v1_0/apiuser/${apiUserId}/apikey`,
          {},
          {
            headers: {
              "Content-Type": "application/json",
              "Ocp-Apim-Subscription-Key": key
            }
          }
        )
        .then(response => response.data.apiKey);
    })
    .tap(secret => console.log({ secret }))
    .then(apiSecret => {
      return Buffer.from(`${apiUserId}:${apiSecret}`).toString("base64");
    })
    .tap(basicAuthToken => console.log({ basicAuthToken }))
    .then(basicAuthToken => {
      // Get oauth token
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
          return response.data.access_token;
        });
    })
    .tap(console.log)
    .then(accessToken => {
      const ref = uuid();
      return Promise.resolve()
        .then(() => {
          // request to pay
          return axios.post(
            `https://ericssonbasicapi2.azure-api.net/colection/v1_0/requesttopay`,
            {
              amount: "50",
              currency: "EUR",
              externalId: "123456",
              payer: {
                partyIdType: "MSISDN",
                partyId: "256774290781"
              },
              payerMessage: "testing",
              payeeNote: "hello"
            },
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
                "X-Target-Environment": "sandbox",
                "X-Reference-Id": ref,
                "Ocp-Apim-Subscription-Key": key
              }
            }
          );
        })
        .tap(response => console.log({ request: response.data }))
        .then(() => {
          // Check transaction status
          return axios.get(
            `https://ericssonbasicapi2.azure-api.net/colection/v1_0/requesttopay/${ref}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "X-Target-Environment": "sandbox",
                "Ocp-Apim-Subscription-Key": key
              }
            }
          );
        })
        .tap(response => console.log({ status: response.data }))
        .then(() => {
          // Check balance
          return axios.get(
            `https://ericssonbasicapi2.azure-api.net/colection/v1_0/account/balance`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "X-Target-Environment": "sandbox",
                "Ocp-Apim-Subscription-Key": key
              }
            }
          );
        })
        .tap(response => console.log({ balance: response.data }));
    })
    .catch(error => console.error(error));
}

getToken("sparkpl.ug", "3e31ee4aae9c42da85a88ca0c2cb613a");
