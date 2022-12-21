import { ConnectType, useWallet, Wallet, WalletStatus } from "@terra-money/wallet-provider";
import { WalletStatus as ConnectWalletStatus } from "./WalletProvider";
import { toast } from "react-hot-toast";

import logger from "../lib/logger";

export function terra_wallet_connect(wallet: Wallet): void {
  if (
    wallet.availableConnectTypes.find((c) => {
      return c == "EXTENSION";
    })
  ) {
    if (wallet.status == WalletStatus.WALLET_CONNECTED) {
      return;
    }
    if (wallet.status == WalletStatus.INITIALIZING) {
      return;
      //  wallet.disconnect();
    }

    if (wallet.status == WalletStatus.WALLET_NOT_CONNECTED) {
      // console.log('connecting');
      return wallet.connect(ConnectType.EXTENSION);
      //  } else {
      //   console.log('skipped', wallet.wallets, wallet.connection);
    }
  } else {
    logger(wallet, "terra not installed?");
    toast.error("Terra extension is not installed");
  }
}

export function terra_wallet_disconnect(wallet: Wallet): void {
  wallet.disconnect();
}
export function terra_wallet_status(wallet: Wallet): ConnectWalletStatus {
  switch (wallet.status) {
    case WalletStatus.WALLET_CONNECTED:
      return ConnectWalletStatus.Connected;
    case WalletStatus.WALLET_NOT_CONNECTED:
      return ConnectWalletStatus.NotConnected;
    case WalletStatus.INITIALIZING:
      return ConnectWalletStatus.NotInit;
    default:
      return ConnectWalletStatus.Error;
  }
}
export function terra_wallet_account(wallet: Wallet): string | undefined {
  if (wallet.wallets.length > 0) {
    return wallet.wallets[0].terraAddress;
  }
  return undefined;
}

export function useTerraWallet(): Wallet {
  return useWallet();
}

export function is_terra_available(wallet: Wallet): boolean {
  const ct = wallet.availableConnectTypes.find((c) => {
    return c == "EXTENSION";
  });
  return !!ct;
}
export async function terra_relatedAccountsForWallet(wallet: Wallet, chains: string[]): Promise<Map<string, string>> {
  const account = terra_wallet_account(wallet);
  const ret: Map<string, string> = new Map();
  if (account) {
    chains.forEach((c) => {
      if (c == "phoenix-1" || c == "pisco-1") {
        ret.set(c, account);
      }
    });
  }
  return ret;
}
