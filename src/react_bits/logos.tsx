import { ConnectWallet, WalletChoices } from "../wallet";

import choiceNotConnected from "../icons/NotConnected";
import choiceTerra from "../icons/Terra";
import choiceKeplr from "../icons/Keplr";
import choiceWalletConnect from "../icons/WalletConnect";

export function getChoiceIcon(wallet: ConnectWallet) {
  switch (wallet.choice) {
    case WalletChoices.Keplr:
      return choiceKeplr;
    case WalletChoices.Terra:
      return choiceTerra;
    case WalletChoices.WalletConnect:
      return choiceWalletConnect;
    default:
      return choiceNotConnected;
  }
}
