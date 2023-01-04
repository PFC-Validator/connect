//
import { ConnectWallet, WalletChoices } from "../wallet";
import logger from "../lib/logger";

import {
  MsgWithdrawDelegatorReward as InjMsgWithdrawDelegatorReward,
  MsgWithdrawValidatorCommission as InjMsgWithdrawValidatorCommission,
} from "@injectivelabs/sdk-ts";

import {
  MsgWithdrawDelegatorReward as CosmosMsgWithdrawDelegatorReward,
  MsgWithdrawValidatorCommission as CosmosMsgWithdrawValidatorCommission,
} from "cosmjs-types/cosmos/distribution/v1beta1/tx";
import {
  MsgWithdrawDelegatorReward as TerraMsgWithdrawDelegatorReward,
  MsgWithdrawValidatorCommission as TerraMsgWithdrawValidatorCommission,
} from "@terra-money/terra.js";

export async function claim(wallet: ConnectWallet, chain_id: string, account: string, valOper: string): Promise<any[]> {
  const acctFrom = await wallet.relatedAccountsForWallet([chain_id]);

  if (acctFrom.size == 0) {
    logger(wallet, `${chain_id} not supported on choice ${wallet.choice}`);
    return [];
  }
  //const account = acctFrom.get(chain_id);
  //if (!account) {
  //    logger(wallet, `${chain_id} not supported on choice ${wallet.choice}`);
  //    return [];
  //  }

  switch (wallet.choice) {
    case WalletChoices.Keplr:
      if (chain_id == "injective-1") {
        const commission = InjMsgWithdrawValidatorCommission.fromJSON({
          validatorAddress: valOper,
        });
        const rewards = InjMsgWithdrawDelegatorReward.fromJSON({
          validatorAddress: valOper,
          delegatorAddress: account,
        });
        return [commission, rewards];
        // return [];
      } else {
        const commission = CosmosMsgWithdrawValidatorCommission.fromPartial({
          validatorAddress: valOper,
        });
        const rewards = CosmosMsgWithdrawDelegatorReward.fromPartial({
          validatorAddress: valOper,
          delegatorAddress: account,
        });
        return [
          {
            value: commission,
            typeUrl: "/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission",
          },
          {
            value: rewards,
            typeUrl: "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
          },
        ];
      }

    case WalletChoices.WalletConnect:
    case WalletChoices.Terra:
      const commission = new TerraMsgWithdrawValidatorCommission(valOper);
      const rewards = new TerraMsgWithdrawDelegatorReward(account, valOper);
      return [commission, rewards];

    default:
      logger(wallet, `unknown wallet choice ${wallet.choice}`);
  }
  return [];
}
