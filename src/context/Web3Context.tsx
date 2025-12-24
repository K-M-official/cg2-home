import React, { createContext, useContext, useState, useEffect } from 'react';
import { MultiStakeSDK } from 'multistake';
import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorProvider } from '@coral-xyz/anchor';

interface Web3ContextType {
  isWeb3Mode: boolean;
  toggleWeb3Mode: () => void;
  walletAddress: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isConnecting: boolean;
  multistake: MultiStakeSDK | null;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isWeb3Mode, setIsWeb3Mode] = useState<boolean>(() => {
    const saved = localStorage.getItem('web3_mode');
    return saved === 'true';
  });

  const [walletAddress, setWalletAddress] = useState<string | null>(() => {
    return localStorage.getItem('wallet_address');
  });

  const [isConnecting, setIsConnecting] = useState(false);
  const [multistake, setMultistake] = useState<MultiStakeSDK | null>(null);

  const toggleWeb3Mode = () => {
    setIsWeb3Mode(prev => {
      const newValue = !prev;
      localStorage.setItem('web3_mode', String(newValue));
      return newValue;
    });
  };

  useEffect(() => {
    localStorage.setItem('web3_mode', String(isWeb3Mode));
  }, [isWeb3Mode]);

  const connectWallet = async () => {
    setIsConnecting(true);
    try {
      const { solana } = window as any;

      if (!solana || !solana.isPhantom) {
        alert('Please install Phantom wallet: https://phantom.app/');
        window.open('https://phantom.app/', '_blank');
        return;
      }

      const response = await solana.connect();
      const address = response.publicKey.toString();

      setWalletAddress(address);
      localStorage.setItem('wallet_address', address);

      console.log('Connected to wallet:', address);

      // 每次连接后重新初始化 MultiStakeSDK
      try {
        const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
        const provider = new AnchorProvider(
          connection,
          solana,
          { commitment: 'confirmed' }
        );
        const sdk = MultiStakeSDK.create(provider);
        setMultistake(sdk);
        console.log('MultiStakeSDK initialized successfully');
      } catch (sdkError) {
        console.error('Failed to initialize MultiStakeSDK:', sdkError);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    localStorage.removeItem('wallet_address');
    setMultistake(null); // 清除 MultiStakeSDK 实例
    console.log('Wallet disconnected');
  };

  return (
    <Web3Context.Provider value={{
      isWeb3Mode,
      toggleWeb3Mode,
      walletAddress,
      connectWallet,
      disconnectWallet,
      isConnecting,
      multistake
    }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};
