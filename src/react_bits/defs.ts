import { Coin } from "@cosmjs/stargate";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { OfflineSigner } from "@cosmjs/proto-signing";

export interface MappedCoin {
  readonly denom: string;
  readonly fractionalDigits: number;
}

export type CoinMap = Readonly<Record<string, MappedCoin>>;

export interface FeeOptions {
  upload: number;
  exec: number;
  init: number;
}

export interface AppConfig {
  readonly chainId: string;
  readonly chainName: string;
  readonly addressPrefix: string;
  readonly rpcUrl: string;
  readonly httpUrl?: string;
  readonly faucetUrl?: string;
  readonly feeToken: string;
  readonly stakingToken: string;
  readonly coinMap: CoinMap;
  readonly gasPrice: number;
  readonly fees: FeeOptions;
  readonly codeId?: number;
}

/**
 * Keplr wallet store type definitions, merged from previous kepler ctx and
 * previous wallet ctx.
 *
 * - previous keplr ctx: https://github.com/CosmosContracts/juno-tools/blob/41c256f71d2b8b55fade12fae3b8c6a493a1e3ce/services/keplr.ts
 * - previous wallet ctx: https://github.com/CosmosContracts/juno-tools/blob/41c256f71d2b8b55fade12fae3b8c6a493a1e3ce/contexts/wallet.tsx
 */
export interface KeplrWalletStore {
  accountNumber: number;
  address: string;
  balance: Coin[];
  client: SigningCosmWasmClient | undefined;
  config: AppConfig;
  initialized: boolean;
  initializing: boolean;
  name: string;
  network: string;
  signer: OfflineSigner | undefined;

  /** https://github.com/CosmosContracts/juno-tools/blob/41c256f71d2b8b55fade12fae3b8c6a493a1e3ce/contexts/wallet.tsx#L69-L72 */
  readonly clear: () => void;

  /** https://github.com/CosmosContracts/juno-tools/blob/41c256f71d2b8b55fade12fae3b8c6a493a1e3ce/services/keplr.ts#L50-L62 */
  readonly connect: (walletChange?: boolean | "focus") => Promise<void>;

  /** @see https://github.com/CosmosContracts/juno-tools/blob/41c256f71d2b8b55fade12fae3b8c6a493a1e3ce/services/keplr.ts#L45-L48 */
  readonly disconnect: () => void | Promise<void>;

  readonly getClient: () => SigningCosmWasmClient;
  readonly getSigner: () => OfflineSigner;

  /** @see https://github.com/CosmosContracts/juno-tools/blob/41c256f71d2b8b55fade12fae3b8c6a493a1e3ce/contexts/wallet.tsx#L63 */
  readonly init: (signer?: OfflineSigner) => void;

  /** https://github.com/CosmosContracts/juno-tools/blob/41c256f71d2b8b55fade12fae3b8c6a493a1e3ce/contexts/wallet.tsx#L75-L89 */
  readonly refreshBalance: (address?: string, balance?: Coin[]) => Promise<void>;

  /** @see https://github.com/CosmosContracts/juno-tools/blob/41c256f71d2b8b55fade12fae3b8c6a493a1e3ce/contexts/wallet.tsx#L65 */
  readonly setNetwork: (network: string) => void;

  /** @see https://github.com/CosmosContracts/juno-tools/blob/41c256f71d2b8b55fade12fae3b8c6a493a1e3ce/contexts/wallet.tsx#L91-L93 */
  readonly updateSigner: (singer: OfflineSigner) => void;

  readonly setQueryClient: () => void;
}

/**
 * Compatibility export for references still using `WalletContextType`
 *
 * @deprecated replace with {@link KeplrWalletStore}
 */
export type WalletContextType = KeplrWalletStore;
