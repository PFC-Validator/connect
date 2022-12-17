import { Wallet as TerraWallet } from "@terra-money/use-wallet/useWallet";
import { KeplrWalletStore } from "../react";
//export const WALLETCHOICE = "wallet_choice";

export enum WalletChoices {
  NotSet = "not set",
  Keplr = "keplr",
  Terra = "terra-station",
  WalletConnect = "connect",
}
export enum WalletStatus {
  Uninit = "Not Init",
  Connected = "connected",
  NotConnected = "not connected",
  NotSet = "not set",
  Error = "Error",
}

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
}
