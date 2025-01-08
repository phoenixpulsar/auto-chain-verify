import { useEffect, useState } from "react";

import "@/styles/globals.css";
import { NearContext } from "@/context";
import { Navigation } from "@/components/Navigation";

import { Wallet } from "@/wallets/near";
import { NetworkId } from "@/config";
import Search from "@/components/Search";

const wallet = new Wallet({ networkId: NetworkId });

export default function MyApp({ Component, pageProps }) {
  const [signedAccountId, setSignedAccountId] = useState("");

  useEffect(() => {
    wallet.startUp(setSignedAccountId);
  }, []);

  return (
    <NearContext.Provider value={{ wallet, signedAccountId }}>
      <Navigation />
      <h1>Hello NEAR World</h1>
      <Search />
      <Component {...pageProps} />
    </NearContext.Provider>
  );
}
