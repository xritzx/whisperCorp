import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { LightNode, Protocols, createLightNode, waitForRemotePeer } from '@waku/sdk';
import { notification } from '~~/utils/scaffold-eth';

interface LightNodeContextValue {
  node: LightNode | null;
  isLoading: boolean;
}

const LightNodeContext = createContext<LightNodeContextValue>({ node: null, isLoading: true });
interface LightNodeProviderProps {
  children: ReactNode;
}

export const LightNodeProvider: React.FC<LightNodeProviderProps> = ({ children }) => {
  const [lightNode, setLightNode] = useState<LightNode | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeNode = async () => {
      try {
        const node = await createLightNode({ defaultBootstrap: true, pingKeepAlive: 2 });
        await node.start();
        await waitForRemotePeer(node, [Protocols.Store, Protocols.Filter, Protocols.LightPush], 15000);
        console.log("Peers:", node.libp2p.getPeers());
        setLightNode(node);
        setIsLoading(false)
      } catch (error) {
        console.error('Error initializing light node:', error);
        notification.warning('No waku remote peers found');
      }
    };
    initializeNode().catch(e => notification.warning(`No waku remote peers found, ${e}`));
  }, []);
  

  return <LightNodeContext.Provider value={{ node: lightNode, isLoading }}>{children}</LightNodeContext.Provider>;
};

export const useLightNode = () => useContext(LightNodeContext);
