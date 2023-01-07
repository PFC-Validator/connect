import { Window as KeplrWindow } from "@keplr-wallet/types";
import { KeplrWalletStore, useWallet } from "../react";
import { WalletStatus as ConnectWalletStatus } from "./WalletProvider";

import { CosmosChainId } from "@injectivelabs/ts-types";
import { KeplrWallet as InjKeplrWallet } from "@injectivelabs/wallet-ts/dist/wallets/keplr";
import {
  ChainRestAuthApi,
  ChainRestTendermintApi,
  createTransaction,
  createTxRawFromSigResponse,
} from "@injectivelabs/sdk-ts";

import { defaultRegistryTypes, GasPrice, StdFee } from "@cosmjs/stargate";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { Registry } from "@cosmjs/proto-signing";
import { MsgTransfer } from "cosmjs-types/ibc/applications/transfer/v1/tx";

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

export async function keplr_submit(
  chain_id: string,
  account: string,
  msgs: any[],
  api: string,
  rpc: string,
  gasPrice: GasPrice,
  memo: string,
  fee: number | StdFee | "auto",
): Promise<string | undefined> {
  if (!window.keplr) {
    return Promise.resolve(undefined);
  }
  if (!account) {
    console.log("unable to get account for chain (null)", chain_id);
    return Promise.resolve(undefined);
  }
  if (chain_id === "injective-1") {
    const injWallet = new InjKeplrWallet(CosmosChainId.Injective);
    //const accounts = await injWallet.getAccounts();
    const offlineSigner = await injWallet.getOfflineSigner();
    const chainRestApi = new ChainRestAuthApi(api);
    const chainRestTMApi = new ChainRestTendermintApi(api);
    const accountDetail = await chainRestApi.fetchCosmosAccount(account);
    const latestBlock = await chainRestTMApi.fetchLatestBlock();
    const { txRaw } = createTransaction({
      accountNumber: Number(accountDetail.account_number),
      chainId: CosmosChainId.Injective,
      memo: memo,
      message: msgs.map((m) => m.toDirectSign()),
      pubKey: accountDetail.pub_key.key,
      sequence: Number(accountDetail.sequence),
      timeoutHeight: Number(latestBlock.header.height) + 40,
      // TODO: specify fee
    });
    const signed = await offlineSigner.signDirect(account, {
      bodyBytes: txRaw.getBodyBytes_asU8(),
      chainId: CosmosChainId.Injective,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      accountNumber: accountDetail.account_number,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      authInfoBytes: txRaw.getAuthInfoBytes(),
    });
    const tx = createTxRawFromSigResponse(signed);
    const txHash = await injWallet.broadcastTx(tx);
    return Promise.resolve(txHash);

    // return Promise.resolve("not implemented");
  } else {
    const offline = window.keplr.getOfflineSigner(chain_id);
    const registry = new Registry(defaultRegistryTypes);
    registry.register("/ibc.applications.transfer.v1.MsgTransfer", MsgTransfer);

    const signer = await SigningCosmWasmClient.connectWithSigner(rpc, offline, {
      gasPrice,
      registry,
    });
    //console.log(signer);
    //signer.getTx("s");

    const txResponse = await signer.signAndBroadcast(account, msgs, fee, memo);
    // eslint-disable-next-line no-console
    console.log("tx Response", txResponse);
    return Promise.resolve(txResponse.transactionHash);
  }
}
