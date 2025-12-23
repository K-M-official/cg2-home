import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import MemorialPage from '../pages/MemorialPage';
import Web3MemorialPage from '../pages/Web3MemorialPage';

const MemorialPageRouter: React.FC = () => {
  const { isWeb3Mode } = useWeb3();

  return isWeb3Mode ? <Web3MemorialPage /> : <MemorialPage />;
};

export default MemorialPageRouter;
