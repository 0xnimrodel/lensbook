import { Fragment, useEffect, useState } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import WalletConnect from "@walletconnect/web3-provider";
import { useGlobalContext } from "@hooks/useGlobalContext";
import { Menu, Transition } from "@headlessui/react";

const providerOptions = {
  walletconnect: {
    package: WalletConnect, // required
    options: {
      infuraId: process.env.INFURA_KEY, // required
    },
  },
};

let web3Modal: any;

const truncateAddress = (address: string) => {
  if (!address) return "No Account";
  const match = address.match(
    /^(0x[a-zA-Z0-9]{3})[a-zA-Z0-9]+([a-zA-Z0-9]{5})$/
  );
  if (!match) return address;
  return `${match[1]}…${match[2]}`;
};

const toHex = (num: number) => {
  const val = Number(num);
  return "0x" + val.toString(16);
};

export default function ConnectBtn() {
  const [provider, setProvider] = useState<any>();
  const [error, setError] = useState<any>("");
  const [chainId, setChainId] = useState<any>();
  const [network, setNetwork] = useState<any>();

  const {
    isTestnet,
    address,
    setAddress,
    library,
    setLibrary: setLibrary,
  } = useGlobalContext();

  const networkParams = isTestnet
    ? {
        chainId: toHex(80001),
        rpcUrls: ["https://rpc-mumbai.maticvigil.com"],
        chainName: "Mumbai",
        nativeCurrency: { name: "Matic", decimals: 18, symbol: "MATIC" },
        // blockExplorerUrl: ["https://polygonscan.com"],
        iconUrls: ["https://cryptologos.cc/logos/polygon-matic-logo.svg?v=023"],
      }
    : {
        chainId: toHex(137),
        rpcUrls: ["https://polygon-rpc.com"],
        chainName: "Polygon Mainnet",
        nativeCurrency: { name: "Matic", decimals: 18, symbol: "MATIC" },
        // blockExplorerUrl: ["https://polygonscan.com"],
        iconUrls: ["https://cryptologos.cc/logos/polygon-matic-logo.svg?v=023"],
      };

  useEffect(() => {
    web3Modal = new Web3Modal({
      cacheProvider: true, // optional
      providerOptions, // required
    });
  }, []);

  useEffect(() => {
    checkChainId();
  }, [chainId]);

  const connectWallet = async () => {
    try {
      const provider = await web3Modal.connect();
      const library = new ethers.providers.Web3Provider(provider, "any");
      const accounts = await library.listAccounts();
      const network = await library.getNetwork();
      setProvider(provider);
      setLibrary(library);
      if (accounts) {
        setAddress(accounts[0]);
      }

      console.log("network.chainId", network.chainId);
      setNetwork(network);
      setChainId(network.chainId);
    } catch (error) {
      setError(error);
    }
  };

  const checkChainId = async () => {
    if (address && (isTestnet ? chainId != 80001 : chainId != 137)) {
      switchNetwork();
    }
  };

  const switchNetwork = async () => {
    try {
      await library.provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: toHex(isTestnet ? 80001 : 137) }],
      });
      setChainId(isTestnet ? 80001 : 137);
      setNetwork(library.getNetwork());
    } catch (switchError: any) {
      console.log('switchError', switchError)
      if (switchError.code === 4902) {
        console.log('switchError 4902')
        try {
          await library.provider.request({
            method: "wallet_addEthereumChain",
            params: [networkParams],
          });
          setChainId(isTestnet ? 80001 : 137);
          setNetwork(library.getNetwork());
        } catch (error) {
          setError(error);
          disconnect();
        }
      }
    }
  };

  const refreshState = () => {
    setAddress(undefined);
    setChainId(undefined);
    setNetwork("");
  };

  const disconnect = async () => {
    await web3Modal.clearCachedProvider();
    refreshState();
  };

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connectWallet();
    }
  }, []);

  useEffect(() => {
    if (provider?.on) {
      const handleAccountsChanged = (accounts: any) => {
        console.log("accountsChanged", accounts);
        accounts && setAddress(accounts[0]);
      };

      const handleChainChanged = (_hexChainId: any) => {
        setChainId(_hexChainId);
      };

      const handleDisconnect = () => {
        console.log("disconnect", error);
        disconnect();
      };

      provider.on("accountsChanged", handleAccountsChanged);
      provider.on("chainChanged", handleChainChanged);
      provider.on("disconnect", handleDisconnect);

      return () => {
        if (provider.removeListener) {
          provider.removeListener("accountsChanged", handleAccountsChanged);
          provider.removeListener("chainChanged", handleChainChanged);
          provider.removeListener("disconnect", handleDisconnect);
        }
      };
    }
  }, [provider]);

  return (
    <>
      <div>
        {!address ? (
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-emerald-700 bg-emerald-100 hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            onClick={connectWallet}
          >
            Connect Wallet
          </button>
        ) : (
          <div>
            <Menu as="div" className="relative inline-block text-left">
              <div>
                <Menu.Button className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                  {truncateAddress(address)}
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-36 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-2">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={disconnect}
                          className={`${
                            active ? "bg-gray-100" : "text-gray-900"
                          } group flex w-full items-center px-2 py-2 text-sm semibold`}
                        >
                          Disconnect
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        )}
      </div>
    </>
  );
}
