import { useCallback, useEffect, useReducer, useState } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { providers } from "ethers";
import WalletConnect from "@walletconnect/web3-provider";
import { useGlobalContext } from "@hooks/useGlobalContext";

export const providerOptions = {
  walletconnect: {
    package: WalletConnect, // required
    options: {
      infuraId: process.env.INFURA_KEY, // required
    },
  },
};

let web3Modal: any;
if (typeof window !== "undefined") {
  web3Modal = new Web3Modal({
    network: "mainnet", // optional
    cacheProvider: true,
    providerOptions, // required
  });
}

type StateType = {
  provider?: any;
  web3Provider?: any;
  address?: string | null;
  chainId?: number | null;
};

type ActionType =
  | {
      type: "SET_WEB3_PROVIDER";
      provider?: StateType["provider"];
      web3Provider?: StateType["web3Provider"];
      address?: StateType["address"];
      chainId?: StateType["chainId"];
    }
  | {
      type: "SET_ADDRESS";
      address?: StateType["address"];
    }
  | {
      type: "SET_CHAIN_ID";
      chainId?: StateType["chainId"];
    }
  | {
      type: "RESET_WEB3_PROVIDER";
    };

const initialState: StateType = {
  provider: null,
  web3Provider: null,
  address: null,
  chainId: null,
};

function reducer(state: StateType, action: ActionType): StateType {
  switch (action.type) {
    case "SET_WEB3_PROVIDER":
      return {
        ...state,
        provider: action.provider,
        web3Provider: action.web3Provider,
        address: action.address,
        chainId: action.chainId,
      };
    case "SET_ADDRESS":
      return {
        ...state,
        address: action.address,
      };
    case "SET_CHAIN_ID":
      return {
        ...state,
        chainId: action.chainId,
      };
    case "RESET_WEB3_PROVIDER":
      return initialState;
    default:
      throw new Error();
  }
}

export default function ConnectButton() {
  const [state, dispatch] = useReducer(reducer, initialState);
    const [library, setLibrary] = useState();

  const { provider, web3Provider, address, chainId } = state;

  const {
    provider: globalProvider,
    setProvider: globalSetProvider,
    address: globalAddress,
    setAddress: setGlobalAddress,
  } = useGlobalContext();

  const connect = useCallback(async function () {
    const provider = await web3Modal.connect();
    console.log("connectButton - provider: ", provider);
    const web3Provider = new providers.Web3Provider(provider);
    console.log("connectButton - web3Provider: ", web3Provider);

    const signer = web3Provider.getSigner();
    const address = await signer.getAddress();
    const network = await web3Provider.getNetwork();

    globalSetProvider(web3Provider);
    setGlobalAddress(address);

    dispatch({
      type: "SET_WEB3_PROVIDER",
      provider,
      web3Provider,
      address,
      chainId: network.chainId,
    });
  }, []);

  const disconnect = useCallback(
    async function () {
      await web3Modal.clearCachedProvider();
      if (provider?.disconnect && typeof provider.disconnect === "function") {
        await provider.disconnect();
      }
      dispatch({
        type: "RESET_WEB3_PROVIDER",
      });

      globalSetProvider(undefined);
      setGlobalAddress(undefined);
    },
    [provider]
  );

  // Auto connect to the cached provider
  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connect();
    }
  }, [connect]);

  useEffect(() => {
    if (provider?.on) {
      const handleAccountsChanged = (accounts: string[]) => {
        // eslint-disable-next-line no-console
        console.log("accountsChanged", accounts);
        dispatch({
          type: "SET_ADDRESS",
          address: accounts[0],
        });
      };

      // https://docs.ethers.io/v5/concepts/best-practices/#best-practices--network-changes
      const handleChainChanged = (_hexChainId: string) => {
        window.location.reload();
      };

      const handleDisconnect = (error: { code: number; message: string }) => {
        // eslint-disable-next-line no-console
        console.log("disconnect", error);
        disconnect();
      };

      provider.on("accountsChanged", handleAccountsChanged);
      provider.on("chainChanged", handleChainChanged);
      provider.on("disconnect", handleDisconnect);

      // Subscription Cleanup
      return () => {
        if (provider.removeListener) {
          provider.removeListener("accountsChanged", handleAccountsChanged);
          provider.removeListener("chainChanged", handleChainChanged);
          provider.removeListener("disconnect", handleDisconnect);
        }
      };
    }
  }, [provider, disconnect]);

  return (
    <>
      {!address ? (
        <button
          onClick={connect}
          className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-emerald-700 bg-emerald-100 hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        >
          Connect Wallet
        </button>
      ) : (
        <button
          onClick={disconnect}
          className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        >
          {address?.substring(0, 6) +
            "..." +
            address?.substring(address.length - 6)}
        </button>
      )}
    </>
  );
}
