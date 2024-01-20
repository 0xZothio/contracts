import "@rainbow-me/rainbowkit/styles.css";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";

import { polygon, arbitrum , polygonMumbai } from "wagmi/chains";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

import "../styles/globals.css";


const { chains, publicClient } = configureChains(
  [polygon, arbitrum,polygonMumbai],
  [
    jsonRpcProvider({
      rpc: (chainId) => {
        if (chainId.id == 137) {
          return {
            http: "https://polygon-mainnet.g.alchemy.com/v2/ZLSEk8HyDPO8GF7NmrIZpRxxxKAY1zgr",
            webSocket:
              "wss://polygon-mainnet.g.alchemy.com/v2/ZLSEk8HyDPO8GF7NmrIZpRxxxKAY1zgr",
          };
        } else if (chainId.id == 42161) {
          return {
            http: "https://arb-mainnet.g.alchemy.com/v2/eCm1C8c0ke-nbr-n7sZ9S_UUovDTlTV6",
            webSocket:
              "wss://arb-mainnet.g.alchemy.com/v2/eCm1C8c0ke-nbr-n7sZ9S_UUovDTlTV6",
          };
        } else if (chainId.id == 80001) {
          return {
            http: "https://rpc-mumbai.maticvigil.com",
            webSocket:
              "wss://polygon-mumbai.g.alchemy.com/v2/EaKu789oxhWzYFvzEzOPAkCqIl2CwKj5",
          };
        }
      },
    }),
  ]
);


const { connectors } = getDefaultWallets({
  appName: "Everything Gas Less",
  projectId: "87106bd465234d097b8a51ba585bf799",
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

function MyApp({ Component, pageProps }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
