import { useEffect, useState } from "react";

import "@/styles/globals.css";
import { NearContext } from "@/context";
import { Navigation } from "@/components/Navigation";
import Vehicles from "@/components/Vehicles";

import { Wallet } from "@/wallets/near";
import { NetworkId } from "@/config";

const wallet = new Wallet({ networkId: NetworkId });

export default function MyApp() {
  const [signedAccountId, setSignedAccountId] = useState("");

  useEffect(() => {
    wallet.startUp(setSignedAccountId);
  }, []);

  return (
    <NearContext.Provider value={{ wallet, signedAccountId }}>
      <Navigation />
      <h1>Hello NEAR World</h1>
      <Vehicles />
    </NearContext.Provider>
  );
}
