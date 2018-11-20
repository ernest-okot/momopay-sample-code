export { default as Collections } from "./collections";
export { default as Users } from "./users";

export interface Config {
  userId: string;
  userSecret: string;
  subscriptionKey: string;
  environment: "sandbox" | "production";
}
