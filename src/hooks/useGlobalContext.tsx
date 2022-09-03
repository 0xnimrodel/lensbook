import React, { createContext, useContext, useEffect, useState } from "react";

interface GlobalContextProps {
  address: string | undefined;
  setAddress: React.Dispatch<React.SetStateAction<string | undefined>>;
  library: any;
  setLibrary: React.Dispatch<React.SetStateAction<any>>;
  children?: React.ReactNode;
  isTestnet: boolean;
  setIsTestnet: React.Dispatch<React.SetStateAction<boolean>>;
}

const GlobalContext = createContext({} as GlobalContextProps);

export const GlobalContextProvider: React.FC<GlobalContextProps> = ({
  children,
}) => {
  const [address, setAddress] = useState<string | undefined>();
  const [library, setLibrary] = useState<any>(null);
  const [isTestnet, setIsTestnet] = useState(true);

  return (
    <GlobalContext.Provider
      value={{
        address,
        setAddress,
        library,
        setLibrary,
        isTestnet,
        setIsTestnet,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
