import { useEffect } from "react";
import { useEffectOnce, useLocalStorage, useReadLocalStorage } from "usehooks-ts";
import { Connector, useAccount, useConnect } from "wagmi";
import scaffoldConfig from "~~/scaffold.config";
import { useGlobalState } from "~~/services/store/store";

const SCAFFOLD_WALLET_STROAGE_KEY = "scaffoldEth2.wallet";
const WAGMI_WALLET_STORAGE_KEY = "wagmi.wallet";

// ID of the SAFE connector instance
const SAFE_ID = "safe";

/**
 * This function will get the initial wallet connector (if any), the app will connect to
 * @param previousWalletId
 * @param connectors
 * @returns
 */
const getInitialConnector = (
  previousWalletId: string,
  connectors: Connector[],
): { connector: Connector | undefined; chainId?: number } | undefined => {
  // Look for the SAFE connector instance and connect to it instantly if loaded in SAFE frame
  const safeConnectorInstance = connectors.find(connector => connector.id === SAFE_ID && connector.ready);

  if (safeConnectorInstance) {
    return { connector: safeConnectorInstance };
  }

  if (scaffoldConfig.walletAutoConnect) {
    const connector = connectors.find(f => f.id === previousWalletId);
    return { connector };
  }

  return undefined;
};

/**
 * Automatically connect to a wallet/connector based on config and prior wallet
 */
export const useAutoConnect = (): void => {
  const wagmiWalletValue = useReadLocalStorage<string>(WAGMI_WALLET_STORAGE_KEY);
  const [walletId, setWalletId] = useLocalStorage<string>(SCAFFOLD_WALLET_STROAGE_KEY, wagmiWalletValue ?? "");
  const connectState = useConnect();
  const accountState = useAccount();
  const { setAccountAddress } = useGlobalState();

  useEffect(() => {
    if (accountState.isConnected) {
      // user is connected, set walletName
      setWalletId(accountState.connector?.id ?? "");
      setAccountAddress(accountState.address || "");
    } else {
      // user has disconnected, reset walletName
      window.localStorage.setItem(WAGMI_WALLET_STORAGE_KEY, JSON.stringify(""));
      setWalletId("");
      setAccountAddress("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountState.isConnected, accountState.connector?.name]);

  useEffectOnce(() => {
    const initialConnector = getInitialConnector(walletId, connectState.connectors);

    if (initialConnector?.connector) {
      connectState.connect({ connector: initialConnector.connector, chainId: initialConnector.chainId });
    }
  });
};
