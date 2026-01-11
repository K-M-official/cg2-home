import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { MultiStakeSDK } from 'multistake';
import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorProvider } from '@coral-xyz/anchor';

interface Web3ContextType {
  isWeb3Mode: boolean;
  toggleWeb3Mode: () => void;
  walletAddress: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  multistake: MultiStakeSDK | null;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

// 获取 Solana RPC endpoint
const getEndpoint = () => {
  return window.location.hostname === 'localhost'
    ? 'http://192.168.31.134:8899'
    : 'https://api.devnet.solana.com';
};

export const Web3Provider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isWeb3Mode, setIsWeb3Mode] = useState<boolean>(() => {
    const saved = localStorage.getItem('web3_mode');
    return saved === 'true';
  });

  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [multistake, setMultistake] = useState<MultiStakeSDK | null>(null);

  const toggleWeb3Mode = () => {
    setIsWeb3Mode(prev => {
      const newValue = !prev;
      localStorage.setItem('web3_mode', String(newValue));
      return newValue;
    });
  };

  // 统一的 SDK 初始化函数
  const initializeSDK = useCallback(() => {
    const { solana } = window as any;

    console.log('[SDK Init] Called - isConnected:', solana?.isConnected, 'publicKey:', solana?.publicKey?.toString());

    if (!solana?.isConnected || !solana?.publicKey) {
      setMultistake(null);
      return;
    }

    console.log('[SDK Init] Starting initialization...');
    try {
      const connection = new Connection(getEndpoint(), 'confirmed');
      const provider = new AnchorProvider(connection, solana, { commitment: 'confirmed' });
      const sdk = MultiStakeSDK.create(provider);
      setMultistake(sdk);
      console.log('[SDK Init] ✅ Success');
    } catch (error) {
      console.error('[SDK Init] ❌ Failed:', error);
      setMultistake(null);
    }
  }, []);

  // 页面加载时自动连接
  useEffect(() => {
    const autoConnect = async () => {
      console.log('[Auto Connect] Checking Phantom wallet...');
      const { solana } = window as any;
      console.log('[Auto Connect] solana object:', solana);
      console.log('[Auto Connect] isPhantom:', solana?.isPhantom);

      if (!solana?.isPhantom) {
        console.log('[Auto Connect] Phantom not found');
        return;
      }

      console.log('[Auto Connect] Attempting to connect with onlyIfTrusted...');
      try {
        const response = await solana.connect({ onlyIfTrusted: true });
        console.log('[Auto Connect] ✅ Success:', response.publicKey.toString());
        setWalletAddress(response.publicKey.toString());
        initializeSDK();
      } catch (error) {
        console.log('[Auto Connect] No trusted connection, error:', error);
      }
    };

    autoConnect();
  }, [initializeSDK]);

  // 监听钱包事件
  useEffect(() => {
    const { solana } = window as any;
    if (!solana) return;

    const handleConnect = (publicKey: PublicKey) => {
      console.log('[Wallet Event] connect ->', publicKey.toString());
      setWalletAddress(publicKey.toString());
      initializeSDK();
    };

    const handleDisconnect = () => {
      console.log('[Wallet Event] disconnect');
      setWalletAddress(null);
      setMultistake(null);
    };

    const handleAccountChanged = (publicKey: PublicKey | null) => {
      console.log('[Wallet Event] accountChanged ->', publicKey?.toString() || 'null');
      if (publicKey) {
        setWalletAddress(publicKey.toString());
        initializeSDK();
      } else {
        setWalletAddress(null);
        setMultistake(null);
      }
    };

    solana.on('connect', handleConnect);
    solana.on('disconnect', handleDisconnect);
    solana.on('accountChanged', handleAccountChanged);

    return () => {
      solana.removeListener('connect', handleConnect);
      solana.removeListener('disconnect', handleDisconnect);
      solana.removeListener('accountChanged', handleAccountChanged);
    };
  }, [initializeSDK]);

  // 连接钱包
  const connectWallet = async () => {
    console.log('[Connect Wallet] User clicked connect button');
    try {
      const { solana } = window as any;

      if (!solana?.isPhantom) {
        console.log('[Connect Wallet] Phantom not installed');
        alert('Please install Phantom wallet: https://phantom.app/');
        window.open('https://phantom.app/', '_blank');
        return;
      }

      console.log('[Connect Wallet] Requesting connection...');
      const response = await solana.connect();
      console.log('[Connect Wallet] ✅ Connected:', response.publicKey.toString());
      setWalletAddress(response.publicKey.toString());
      initializeSDK();
    } catch (error) {
      console.error('[Connect Wallet] ❌ Failed:', error);
      alert('Failed to connect wallet');
    }
  };

  // 断开钱包
  const disconnectWallet = async () => {
    const { solana } = window as any;
    if (solana) await solana.disconnect();

    setWalletAddress(null);
    setMultistake(null);
  };

  return (
    <Web3Context.Provider value={{
      isWeb3Mode,
      toggleWeb3Mode,
      walletAddress,
      connectWallet,
      disconnectWallet,
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
