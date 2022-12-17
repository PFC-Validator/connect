import { AppConfig } from "./defs";

export const mainnetConfig: AppConfig = {
  chainId: "phoenix-1",
  chainName: "Terra2",
  addressPrefix: "terra",
  rpcUrl: "https://terra2-rpc.dalnim.finance",
  feeToken: "uluna",
  stakingToken: "uluna",
  coinMap: {
    uluna: { denom: "LUNA", fractionalDigits: 6 },
  },
  gasPrice: 0.015,
  fees: {
    upload: 1500000,
    init: 500000,
    exec: 200000,
  },
};

export const uniTestnetConfig: AppConfig = {
  chainId: "uni-5",
  chainName: "Uni",
  addressPrefix: "juno",
  rpcUrl: "https://rpc.uni.juno.deuslabs.fi",
  httpUrl: "https://lcd.uni.juno.deuslabs.fi",
  faucetUrl: "https://faucet.uni.juno.deuslabs.fi",
  feeToken: "ujunox",
  stakingToken: "ujunox",
  coinMap: {
    ujunox: { denom: "JUNOX", fractionalDigits: 6 },
  },
  gasPrice: 0.025,
  fees: {
    upload: 1500000,
    init: 500000,
    exec: 200000,
  },
};

// TODO read this stuff from CosmosDirectory ... or something non-async/cached
export const getConfig = (network: string): AppConfig => {
  if (network === "mainnet") return mainnetConfig;
  return uniTestnetConfig;
};
