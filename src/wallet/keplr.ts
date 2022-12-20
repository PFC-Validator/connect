import { Window as KeplrWindow } from "@keplr-wallet/types";
import { KeplrWalletStore, useWallet } from "../react";
import { WalletStatus as ConnectWalletStatus } from "./WalletProvider";

//import { KeplrWalletStore, useWallet } from '@/keplr/contexts/wallet';
declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Window extends KeplrWindow {}
}
export function useKeplrWallet(): KeplrWalletStore {
  return useWallet();
}
export async function keplr_wallet_connect(wallet: KeplrWalletStore): Promise<void> {
  //console.log(wallet);
  return wallet.connect();
}
export function keplr_wallet_disconnect(wallet: KeplrWalletStore): Promise<void> {
  return Promise.resolve(wallet.disconnect());
}
export function keplr_wallet_account(wallet: KeplrWalletStore): string | undefined {
  return wallet.address;
}
export function keplr_wallet_status(wallet: KeplrWalletStore): ConnectWalletStatus {
  if (wallet.initializing) {
    return ConnectWalletStatus.NotInit;
  }

  if (wallet.initialized) {
    return ConnectWalletStatus.Connected;
  }

  return ConnectWalletStatus.NotConnected;
}
export function is_keplr_available(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return !(!window.getOfflineSigner || !window.keplr || !window.getOfflineSignerAuto);
}
