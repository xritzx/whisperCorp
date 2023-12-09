import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { LightNode, Protocols, createLightNode, waitForRemotePeer } from '@waku/sdk';

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
        const node = await createLightNode({ defaultBootstrap: true });
        await node.start();
        await waitForRemotePeer(node, [Protocols.Store, Protocols.Filter, Protocols.LightPush]);
        setLightNode(node);
      } catch (error) {
        console.error('Error initializing light node:', error);
        setIsLoading(true);
      } finally {
      }
    };
    initializeNode();
  }, []);
  

  return <LightNodeContext.Provider value={{ node: lightNode, isLoading }}>{children}</LightNodeContext.Provider>;
};

export const useLightNode = () => useContext(LightNodeContext);
