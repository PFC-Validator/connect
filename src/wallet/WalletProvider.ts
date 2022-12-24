import { Wallet as TerraWallet } from "@terra-money/use-wallet/useWallet";
import { KeplrWalletStore } from "../react";
import { GasPrice, StdFee } from "@cosmjs/stargate";
import { EncodeObject } from "@cosmjs/proto-signing";
//export const WALLETCHOICE = "wallet_choice";

export enum WalletChoices {
  NotSet = "NotSet",
  Keplr = "Keplr",
  Terra = "Terra",
  WalletConnect = "WalletConnect",
}
export enum WalletStatus {
  NotInit = "NotInit",
  Connected = "Connected",
  NotConnected = "NotConnected",
  NotSet = "NotSet",
  Error = "Error",
}
export type ConnectGetMessage = (
  wallet: ConnectWallet,
  chain_id: string,
  account: string,
) => Promise<(any | EncodeObject)[]>;
export interface ConnectWallet {
  readonly t: TerraWallet;

  readonly k: KeplrWalletStore;
  readonly choices: Set<WalletChoices>;
  readonly choice: WalletChoices;
  readonly status: WalletStatus;
  init(): Promise<void>;
  account(): string | undefined;
  disconnect(): void | Promise<void>;
  connect(choice?: WalletChoices): Promise<void>;
  setChoice(choice: WalletChoices): boolean;
  isSet(): boolean;
  setWalletChoiceToLocalStorage(): void;
  getWalletChoiceFromLocalStorage(): void;
  setT(t: TerraWallet): void;
  setK(k: KeplrWalletStore): void;
  getStatus(): WalletStatus;
  getWalletName(): string;
  relatedAccountsForWallet(chains: string[]): Promise<Map<string, string>>;
  submit(
    getMessages: ConnectGetMessage,
    chain_id: string,
    api: string,
    rpc: string,
    gasPrice: GasPrice,
    memo: string,
    fee: number | StdFee | "auto",
  ): Promise<string | undefined>;
}
