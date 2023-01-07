import { getShortAddress } from "../lib/utils";
import { Wallet as TerraWallet } from "@terra-money/wallet-provider";
import { ConnectGetMessage, ConnectWallet, WalletChoices, WalletStatus } from "./WalletProvider";
import {
  is_keplr_available,
  keplr_relatedAccountsForWallet,
  keplr_submit,
  keplr_wallet_account,
  keplr_wallet_connect,
  keplr_wallet_disconnect,
  keplr_wallet_status,
  useKeplrWallet,
} from "./keplr";
import {
  is_terra_available,
  terra_relatedAccountsForWallet,
  terra_submit,
  terra_wallet_account,
  terra_wallet_connect,
  terra_wallet_disconnect,
  terra_wallet_status,
  useTerraWallet,
} from "./terra";
import {
  is_walletconnect_available,
  walletconnect_relatedAccountsForWallet,
  walletconnect_wallet_account,
  walletconnect_wallet_connect,
  walletconnect_wallet_disconnect,
  walletconnect_wallet_status,
} from "./wallet_connect";
import { KeplrWalletStore } from "../react_bits";
import logger from "../lib/logger";
import { GasPrice, StdFee } from "@cosmjs/stargate";

export * from "./WalletProvider";

const WALLET_CHOICE = "connect_walletchoice";
export function getWalletPreference(): WalletChoices | undefined {
  const item = localStorage.getItem(WALLET_CHOICE);

  if (item == null) {
    return undefined;
  }
  const values = Object.keys(WalletChoices);
  const val = values.find((v) => v.toLowerCase() == item.toLowerCase());
  if (!val) {
    logger(val, "getWalletPreference VAL not found");
    return undefined;
  }
  return val as WalletChoices;
}

//export const ConnectWalletC =
class ConnectWalletC implements ConnectWallet {
  k: KeplrWalletStore;
  t: TerraWallet;
  choices: Set<WalletChoices>;
  choice: WalletChoices;

  constructor(t: TerraWallet, k: KeplrWalletStore) {
    this.t = t;
    this.k = k;
    this.status = WalletStatus.NotSet;

    this.choice = WalletChoices.NotSet;
    this.choices = new Set<WalletChoices>();
    if (is_terra_available(this.t)) {
      this.choices.add(WalletChoices.Terra);
    }
    if (is_keplr_available()) {
      this.choices.add(WalletChoices.Keplr);
    }
    if (is_walletconnect_available(this.t)) {
      this.choices.add(WalletChoices.WalletConnect);
    }
  }

  setWalletChoiceToLocalStorage(): void {
    localStorage.setItem(WALLET_CHOICE, this.choice);
    if (window) {
      window.dispatchEvent(new Event("storage"));
    }
  }
  getWalletChoiceFromLocalStorage(): boolean {
    const choiceLS = getWalletPreference();
    if (choiceLS) {
      return this.setChoice(choiceLS);
    }
    // console.log("LS not set?");
    return this.setChoice(WalletChoices.NotSet);
  }
  init(): Promise<void> {
    return Promise.resolve(undefined);
  }
  setT(t: TerraWallet): void {
    this.t = t;
    // this.choices = new Set<WalletChoices>();
    if (is_terra_available(this.t)) {
      this.choices.add(WalletChoices.Terra);
    } else {
      this.choices.delete(WalletChoices.Terra);
    }

    if (is_walletconnect_available(this.t)) {
      this.choices.add(WalletChoices.WalletConnect);
    } else {
      this.choices.delete(WalletChoices.WalletConnect);
    }
  }
  setK(k: KeplrWalletStore): void {
    this.k = k;

    if (is_keplr_available()) {
      this.choices.add(WalletChoices.Keplr);
    } else {
      this.choices.delete(WalletChoices.Keplr);
    }
  }
  setChoice(choice: WalletChoices): boolean {
    //    console.log("setChoice", this.choice, choice);
    if (choice == WalletChoices.NotSet) {
      this.status = WalletStatus.NotSet;
    }
    if (this.choices.has(choice)) {
      this.choice = choice;
      //    console.log("setChoice2", this.choice, choice);
      return true;
    }

    logger(this, `attempt to set to un-available choice ${choice}`);
    return false;
  }
  setStatus(): void {
    switch (this.choice) {
      case WalletChoices.WalletConnect:
        this.status = walletconnect_wallet_status(this.t);
        break;
      case WalletChoices.Terra:
        this.status = terra_wallet_status(this.t);
        break;
      case WalletChoices.Keplr:
        this.status = keplr_wallet_status(this.k);
        break;
      case WalletChoices.NotSet:
        this.status = WalletStatus.NotSet;
        break;
    }
  }

  account(): string | undefined {
    //console.log("in account", this.choice);

    switch (this.choice) {
      case WalletChoices.Terra:
        return terra_wallet_account(this.t);
      case WalletChoices.Keplr:
        return keplr_wallet_account(this.k);
      case WalletChoices.WalletConnect:
        return walletconnect_wallet_account(this.t);
      case WalletChoices.NotSet:
        logger(this, "Attempt to get account on not-set wallet");
        return undefined;
      default:
        logger(this, "Attempt to get account on unknown wallet");
        return undefined;
    }
  }
  isSet(): boolean {
    // console.log("isSet", this.choice);
    return this.choice !== WalletChoices.NotSet;
  }
  connect(choice?: WalletChoices): Promise<void> {
    if (choice) {
      this.setChoice(choice);
    }
    //   console.log("connect button");

    switch (this.choice) {
      case WalletChoices.Terra:
        terra_wallet_connect(this.t);
        this.setStatus();
        return Promise.resolve();

      case WalletChoices.Keplr:
        return keplr_wallet_connect(this.k).then(() => {
          this.setStatus();
        });

      case WalletChoices.WalletConnect:
        walletconnect_wallet_connect(this.t);
        this.setStatus();
        return Promise.resolve();

      case WalletChoices.NotSet:
        this.setStatus();
        logger(this, "Attempt to connect account on not-set wallet");
        break;
      default:
        logger(this, "Attempt to connect on unknown wallet");
    }
    return Promise.resolve();
  }
  disconnect(): void | Promise<void> {
    switch (this.choice) {
      case WalletChoices.Terra:
        terra_wallet_disconnect(this.t);
        this.setStatus();
        break;
      case WalletChoices.Keplr:
        return keplr_wallet_disconnect(this.k).then(() => {
          this.setStatus();
        });

      case WalletChoices.WalletConnect:
        walletconnect_wallet_disconnect(this.t);
        this.setStatus();
        break;
      case WalletChoices.NotSet:
        logger(this, "Attempt to get disconnect on not-set wallet");
        break;
      default:
        logger(this, "Attempt to get disconnect on unknown wallet");
    }
  }

  status: WalletStatus;

  getStatus(): WalletStatus {
    this.setStatus();
    return this.status;
  }
  getWalletName(): string {
    switch (this.choice) {
      case WalletChoices.WalletConnect:
      case WalletChoices.Terra:
        return getShortAddress(this.account());

      case WalletChoices.Keplr:
        return this.k.name;

      case WalletChoices.NotSet:
        return "choice not set";
      default:
        logger(this, "Attempt to get getWalletName on unknown wallet");
        return "error";
    }
  }
  relatedAccountsForWallet(chains: string[]): Promise<Map<string, string>> {
    switch (this.choice) {
      case WalletChoices.WalletConnect:
        return walletconnect_relatedAccountsForWallet(this.t, chains);
      case WalletChoices.Terra:
        return terra_relatedAccountsForWallet(this.t, chains);

      case WalletChoices.Keplr:
        return keplr_relatedAccountsForWallet(chains);

      case WalletChoices.NotSet:
        return Promise.resolve(new Map());
      default:
        logger(this, "Attempt to get relatedAccountsForWallet on unknown wallet");
        return Promise.resolve(new Map());
    }
  }
  async submit(
    getMessages: ConnectGetMessage,
    chain_id: string,
    api: string,
    rpc: string,
    gasPrice: GasPrice,
    memo: string,
    fee: StdFee | "auto",
  ): Promise<string | undefined> {
    const accountMap = await this.relatedAccountsForWallet([chain_id]);
    if (accountMap.size != 1) {
      console.log("unable to get account for chain ", chain_id);
      return Promise.resolve(undefined);
    }
    const account = accountMap.get(chain_id);

    if (!account) {
      console.log("unable to get account for chain (null)", chain_id);
      return Promise.resolve(undefined);
    }

    const msgs = await getMessages(this, chain_id, account);
    if (this.choice == WalletChoices.Keplr) {
      return keplr_submit(chain_id, account, msgs, api, rpc, gasPrice, memo, fee);
    }
    if (this.choice == WalletChoices.Terra || this.choice == WalletChoices.WalletConnect) {
      return terra_submit(this.t, chain_id, msgs, memo, fee);
    }

    return undefined;
  }
}
let c: ConnectWallet | undefined = undefined;
export function useConnectWallet(choice?: WalletChoices): ConnectWallet {
  const t = useTerraWallet();
  const k = useKeplrWallet();
  if (c) {
    c.setT(t);
    c.setK(k);
  } else {
    c = new ConnectWalletC(t, k);
  }
  if (choice && choice != WalletChoices.NotSet) {
    c.setChoice(choice);
  }
  return c;
}
