export const NETWORK = process.env.NEXT_PUBLIC_NETWORK || "mainnet";
export const isLocal = process.env.NODE_ENV === "development";

export const showLogger = isLocal ? true : process.env.NEXT_PUBLIC_SHOW_LOGGER === "true" ?? false;
