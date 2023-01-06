//
import { ConnectWallet, WalletChoices } from "../wallet";
import logger from "../lib/logger";

import { MsgTransfer as InjMsgTransfer } from "@injectivelabs/sdk-ts";

import { Coin, MsgTransfer as TerraMsgTransfer } from "@terra-money/terra.js";
import { MsgTransfer as CosmosMsgTransfer } from "cosmjs-types/ibc/applications/transfer/v1/tx";

export async function ibc(
  wallet: ConnectWallet,
  chain_id: string,
  sourceChannel: string,
  sourcePort: string,
  tokenAmount: string,
  tokenDenom: string,
  sender: string,
  receiver: string,
): Promise<any[]> {
  const acctFrom = await wallet.relatedAccountsForWallet([chain_id]);

  if (acctFrom.size == 0) {
    logger(wallet, `${chain_id} not supported on choice ${wallet.choice}`);
    return [];
  }

  switch (wallet.choice) {
    case WalletChoices.Keplr:
      if (chain_id == "injective-1") {
        const ibcXfer = InjMsgTransfer.fromJSON({
          amount: { amount: tokenAmount, denom: tokenDenom },
          channelId: sourceChannel,
          port: sourcePort,
          receiver: receiver,
          sender: sender,
        });

        return [ibcXfer];
        // return [];
      } else {
        const ibcXfer = CosmosMsgTransfer.fromPartial({
          token: { amount: tokenAmount, denom: tokenDenom },
          sourceChannel: sourceChannel,
          sourcePort: sourcePort,
          receiver: receiver,
          sender: sender,
        });

        return [
          {
            value: ibcXfer,
            typeUrl: "/ibc.applications.transfer.v1",
          },
        ];
      }

    case WalletChoices.WalletConnect:
    case WalletChoices.Terra: {
      const token: Coin = new Coin(tokenDenom, tokenAmount);
      return [new TerraMsgTransfer(sourcePort, sourceChannel, token, sender, receiver, undefined, undefined)];
    }
    default:
      logger(wallet, `unknown wallet choice ${wallet.choice}`);
  }
  return [];
}
