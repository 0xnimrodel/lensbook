import { GlobalContextProvider } from "@hooks/useGlobalContext";
import { AppProps } from "next/app";
import { SetStateAction } from "react";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <GlobalContextProvider
      address={""}
      setAddress={function (value: SetStateAction<string | undefined>): void {}}
      library={undefined}
      setLibrary={function (value: any): void {}}
      isTestnet={false}
      setIsTestnet={function (value: SetStateAction<boolean>): void {}}
    >
      <Component {...pageProps} />
    </GlobalContextProvider>
  );
}

export default MyApp;
