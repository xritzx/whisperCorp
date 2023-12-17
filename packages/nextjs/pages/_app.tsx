import type { AppProps } from 'next/app';
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import NextNProgress from 'nextjs-progressbar';
import { Toaster } from 'react-hot-toast';
import { WagmiConfig } from 'wagmi';
import { Footer } from '~~/components/Footer';
import { Header } from '~~/components/Header';
import { BlockieAvatar } from '~~/components/scaffold-eth';
import { LightNodeProvider } from '~~/services/waku/LightNodeContext';
import { wagmiConfig } from '~~/services/web3/wagmiConfig';
import { appChains } from '~~/services/web3/wagmiConnectors';
import '~~/styles/globals.css';
import { useDarkMode } from 'usehooks-ts';
import { useEffect, useState } from 'react';


const ScaffoldEthApp = ({ Component, pageProps }: AppProps) => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const { isDarkMode } = useDarkMode();

  useEffect(() => {
    setIsDarkTheme(isDarkMode);
  }, [isDarkMode]);

  return (
    <WagmiConfig config={wagmiConfig}>
      <NextNProgress />
      <RainbowKitProvider
        chains={appChains.chains}
        avatar={BlockieAvatar}
        theme={isDarkTheme ? darkTheme() : lightTheme()}
      >
        <LightNodeProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="relative flex flex-col flex-1">
              <Component {...pageProps} />
            </main>
            <Footer />
          </div>
        </LightNodeProvider>
        <Toaster />
      </RainbowKitProvider>
    </WagmiConfig>
  );
  
};

export default ScaffoldEthApp;
