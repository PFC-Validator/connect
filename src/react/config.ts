import { AppConfig } from "./defs";
import { ChainInfo } from "@keplr-wallet/types";

export const keplrConfig = (config: AppConfig): ChainInfo => ({
  chainId: config.chainId,
  chainName: config.chainName,
  rpc: config.rpcUrl,
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  rest: config.httpUrl!,
  bech32Config: {
    bech32PrefixAccAddr: `${config.addressPrefix}`,
    bech32PrefixAccPub: `${config.addressPrefix}pub`,
    bech32PrefixValAddr: `${config.addressPrefix}valoper`,
    bech32PrefixValPub: `${config.addressPrefix}valoperpub`,
    bech32PrefixConsAddr: `${config.addressPrefix}valcons`,
    bech32PrefixConsPub: `${config.addressPrefix}valconspub`,
  },
  currencies: [
    {
      coinDenom: config.coinMap[config.feeToken].denom,
      coinMinimalDenom: config.feeToken,
      coinDecimals: config.coinMap[config.feeToken].fractionalDigits,
    },
    {
      coinDenom: config.coinMap[config.stakingToken].denom,
      coinMinimalDenom: config.stakingToken,
      coinDecimals: config.coinMap[config.stakingToken].fractionalDigits,
    },
  ],
  feeCurrencies: [
    {
      coinDenom: config.coinMap[config.feeToken].denom,
      coinMinimalDenom: config.feeToken,
      coinDecimals: config.coinMap[config.feeToken].fractionalDigits,
    },
  ],
  stakeCurrency: {
    coinDenom: config.coinMap[config.stakingToken].denom,
    coinMinimalDenom: config.stakingToken,
    coinDecimals: config.coinMap[config.stakingToken].fractionalDigits,
  },

  bip44: { coinType: 118 },
  //coinType: 118,
  features: ["ibc-transfer", "cosmwasm", "ibc-go"],
});
