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
export async function keplr_relatedAccountsForWallet(chains: string[]): Promise<Map<string, string>> {
  const accounts: Map<string, string> = new Map();

  if (typeof window === "undefined") {
    return Promise.resolve(accounts);
  }
  if (!window?.keplr) {
    return Promise.resolve(accounts);
  }
  const keplr = window.keplr;
  await keplr.enable(chains);

  for (const chain of chains) {
    const signer = keplr.getOfflineSigner(chain);
    const accts = await signer
      .getAccounts()
      .then((accountsChain) => {
        if (accountsChain.length > 0) {
          return accountsChain[0].address;
        }
        return undefined;
      })
      .catch((_r) => {
        console.log("keplr_related", chain, chains, _r);
        return undefined;
      });
    if (accts) {
      accounts.set(chain, accts);
    }
  }

  return accounts;
}
