import Promise from "bluebird";
import Users, { Credentials } from "./users";
import Collections, { PaymentRequest } from "./collections";

function runSandboxCollectionsExample(host: string, subscriptionKey: string) {
  return Promise.resolve()
    .then(() => {
      console.log("STEP 1: Create sandbox credentials");
      const users = new Users({ subscriptionKey });

      return users.create(host).then((userId: string) => {
        return users.login(userId).then((credentials: Credentials) => {
          return new Collections({
            userSecret: credentials.apiKey,
            userId: userId,
            subscriptionKey: subscriptionKey,
            environment: "sandbox"
          });
        });
      });
    })
    .then((collections: Collections) => {
      return Promise.resolve()
        .then(() => {
          console.log("STEP 2: request to pay");
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
          return collections.requestToPay(paymentRequest);
        })
        .tap(transactionId => console.log({ transactionId }))
        .then((transactionId: string) => {
          console.log("STEP 3: Check transaction status");
          return collections.getTransactionStatus(transactionId);
        })
        .tap(status => console.log({ status }))
        .then(() => {
          console.log("STEP 4: Check balance");
          return collections.getAccountBalance();
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
