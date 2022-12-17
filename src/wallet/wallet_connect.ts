import { ConnectType, Wallet, WalletStatus } from "@terra-money/wallet-provider";
import { toast } from "react-hot-toast";

import logger from "../lib/logger";

import { terra_wallet_account, terra_wallet_disconnect, terra_wallet_status, useTerraWallet } from "./terra";
import { WalletStatus as ConnectWalletStatus } from "./WalletProvider";

export function walletconnect_wallet_connect(wallet: Wallet): void {
  if (
    wallet.availableConnectTypes.find((c) => {
      return c == "WALLETCONNECT";
    })
  ) {
    //    console.log('WC2');
    if (wallet.status == WalletStatus.WALLET_CONNECTED) {
      return;
    }
    if (wallet.status == WalletStatus.INITIALIZING) {
      return;
      //  wallet.disconnect();
    }
    //logger(wallet, 'wallet info');
    if (wallet.status == WalletStatus.WALLET_NOT_CONNECTED) {
      // console.log('connecting');
      return wallet.connect(ConnectType.WALLETCONNECT);
      //  } else {
      //   console.log('skipped', wallet.wallets, wallet.connection);
    }
  } else {
    logger(wallet, "terra not installed?");
    toast.error("Terra extension is not installed");
  }
}

export function walletconnect_wallet_disconnect(wallet: Wallet): void {
  return terra_wallet_disconnect(wallet);
}
export function walletconnect_wallet_status(wallet: Wallet): ConnectWalletStatus {
  return terra_wallet_status(wallet);
}
export function walletconnect_wallet_account(wallet: Wallet): string | undefined {
  return terra_wallet_account(wallet);
}

export function useWalletConnect(): Wallet {
  return useTerraWallet();
}

export function is_walletconnect_available(wallet: Wallet): boolean {
  const ct = wallet.availableConnectTypes.find((c) => {
    return c == "WALLETCONNECT";
  });
  return !!ct;
}
