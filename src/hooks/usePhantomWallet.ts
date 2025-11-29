import { useState, useEffect } from 'react';

interface PhantomProvider {
  isPhantom?: boolean;
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  on: (event: string, callback: (...args: any[]) => void) => void;
  request: (params: { method: string }) => Promise<any>;
}

declare global {
  interface Window {
    solana?: PhantomProvider;
  }
}

export const usePhantomWallet = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 检查Phantom是否安装
  const checkIfPhantomInstalled = () => {
    if (window.solana && window.solana.isPhantom) {
      return true;
    }
    return false;
  };

  // 连接钱包
  const connectWallet = async () => {
    console.log('connectWallet called');
    setError(null);
    
    if (!checkIfPhantomInstalled()) {
      setError('Phantom钱包未安装');
      window.open('https://phantom.app/', '_blank');
      return;
    }

    try {
      setIsConnecting(true);
      console.log('Calling window.solana.connect()...');
      const response = await window.solana!.connect();
      console.log('Connect response:', response);
      const address = response.publicKey.toString();
      setWalletAddress(address);
      console.log('钱包已连接:', address);
    } catch (err: any) {
      console.error('连接钱包失败:', err);
      setError(err.message || '连接失败');
    } finally {
      setIsConnecting(false);
    }
  };

  // 断开连接
  const disconnectWallet = async () => {
    try {
      if (window.solana) {
        await window.solana.disconnect();
        setWalletAddress(null);
        console.log('钱包已断开');
      }
    } catch (err: any) {
      console.error('断开连接失败:', err);
      setError(err.message || '断开失败');
    }
  };

  // 检查是否已连接
  useEffect(() => {
    if (checkIfPhantomInstalled()) {
      const provider = window.solana!;

      // 监听连接事件
      provider.on('connect', (publicKey: { toString: () => string }) => {
        console.log('Wallet connected event:', publicKey.toString());
        setWalletAddress(publicKey.toString());
      });

      // 监听断开连接事件
      provider.on('disconnect', () => {
        console.log('Wallet disconnected event');
        setWalletAddress(null);
      });

      // 监听账户变化
      provider.on('accountChanged', (publicKey: any) => {
        if (publicKey) {
          setWalletAddress(publicKey.toString());
        } else {
          setWalletAddress(null);
        }
      });

      // 尝试自动连接（如果之前已授权）
      provider.request({ method: 'connect', params: { onlyIfTrusted: true } })
        .then((response: any) => {
          if (response.publicKey) {
            setWalletAddress(response.publicKey.toString());
          }
        })
        .catch(() => {
          // 忽略错误，用户未授权自动连接
        });
    }
  }, []);

  // 格式化钱包地址显示
  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return {
    walletAddress,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    formatAddress: walletAddress ? formatAddress(walletAddress) : null,
    isInstalled: checkIfPhantomInstalled(),
  };
};

