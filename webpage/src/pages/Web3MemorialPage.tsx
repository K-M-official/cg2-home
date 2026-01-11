import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Hexagon, Globe, Wallet, ExternalLink } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import { PublicKey } from '@solana/web3.js';
import { API_BASE_URL } from '../constants';
import type { PoolInfo, TokenInfo } from 'multistake';
import { AnchorProvider, BN } from '@coral-xyz/anchor';
import { createSyncNativeInstruction, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, NATIVE_MINT } from '@solana/spl-token';
import { Transaction, SystemProgram } from '@solana/web3.js';


interface ItemData {
  id: number;
  title: string;
  description: string;
  misc: any;
  group_id: number;
  created_at: string;
}

interface SolanaMapping {
  mint_address: string;
  pool_address: string;
}

const WSOL_MINT_ADDRESS = new PublicKey('So11111111111111111111111111111111111111112');

// ========== Internal Components ==========

// PoolTokensList Component
interface PoolTokensListProps {
  tokens: Array<{ item_id: number; title: string; mint_address: string }>;
}

const PoolTokensList: React.FC<PoolTokensListProps> = ({ tokens }) => {
  if (tokens.length === 0) return null;
  return (
    <div>
      <label className="text-sm text-slate-400 block mb-2">Other Tokens in This Pool</label>
      <div className="space-y-2">
        {tokens.map((token) => (
          <a key={token.item_id} href={`/memorial/${token.item_id}`}
            className="flex items-center justify-between bg-black/20 rounded-lg p-3 hover:bg-black/30 transition-colors">
            <div className="flex-1">
              <p className="text-white font-medium">{token.title}</p>
              <code className="text-indigo-300 text-xs break-all">{token.mint_address}</code>
            </div>
            <ExternalLink className="w-4 h-4 text-indigo-400 ml-2" />
          </a>
        ))}
      </div>
    </div>
  );
};



const handleWrapSOL = async (wallet: AnchorProvider, stakeAmount: string) => {
  if (!wallet.publicKey) return;

  try {
    const amount = parseInt(stakeAmount);
    // Get WSOL associated token account
    const wsolAccount = await getAssociatedTokenAddress(
      NATIVE_MINT,
      wallet.publicKey
    );

    const transaction = new Transaction();

    // Check if WSOL account exists
    const accountInfo = await wallet.connection.getAccountInfo(wsolAccount);
    if (!accountInfo) {
      // Create WSOL account
      transaction.add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          wsolAccount,
          wallet.publicKey,
          NATIVE_MINT
        )
      );
    }

    // Transfer SOL to WSOL account
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: wsolAccount,
        lamports: amount * 1e9, // Convert SOL to lamports
      })
    );

    // Sync native (wrap SOL)
    transaction.add(createSyncNativeInstruction(wsolAccount));

    // Send transaction
    const signature = await wallet.sendAndConfirm(transaction);
    return signature
  } catch (error: any) {
    console.error('Full error:', error);
  }
};// StakeUnstakePanel Component

interface StakeUnstakePanelProps {
  solanaMapping: SolanaMapping;
  poolInfo: PoolInfo & { items: Array<TokenInfo> };
}

const StakeUnstakePanel: React.FC<StakeUnstakePanelProps> = ({ solanaMapping, poolInfo }) => {
  const [stakeAmount, setStakeAmount] = useState('');
  const { multistake, walletAddress } = useWeb3();
  const [staking, setStaking] = useState(false);
  const [unstaking, setUnstaking] = useState(false);
  const [allPoolTokens, setAllPoolTokens] = useState<Array<{ item_id: number; mint_address: string; title: string }>>([]);
  const [operationLogs, setOperationLogs] = useState<Array<{ time: string; operation: string; message: string; signature?: string }>>([]);

  const poolPubkey = new PublicKey(solanaMapping.pool_address);
  const mintPubkey = new PublicKey(solanaMapping.mint_address);
  const itemIndex = allPoolTokens.findIndex(token => token.mint_address === solanaMapping.mint_address);
  const thisItemInfo = { ...poolInfo.items[itemIndex], ...allPoolTokens[itemIndex] };

  useEffect(() => {
    const loadTokengroups = async () => {
      const mintAddresses = poolInfo.items.map(token => token.mintAccount.toString());
      console.log('[fetchPoolTokens] Mint addresses from pool:', mintAddresses);
      if (mintAddresses.length === 0) {
        console.log('[fetchPoolTokens] No tokens in pool');
        return;
      }
      const itemsResponse = await fetch(`${API_BASE_URL}/api/solana/items-by-mints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mint_addresses: mintAddresses }),
      });
      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json();
        console.log('[fetchPoolTokens] Backend data:', itemsData);

        if (itemsData.tokens) {
          console.log('[fetchPoolTokens] All tokens:', itemsData.tokens);
          // 设置完整列表（包括当前 token）
          setAllPoolTokens(itemsData.tokens);
        } else {
          console.log('[fetchPoolTokens] No tokens in response');
        }
      } else {
        console.error('[fetchPoolTokens] Backend request failed:', await itemsResponse.text());
      }
    }
    loadTokengroups();
  }, [multistake]);


  const handleStake = async () => {
    if (!multistake || !walletAddress) {
      console.error('Please check wallet connection, pool address and amount');
      return;
    }
    setStaking(true);
    try {
      const amount = parseFloat(stakeAmount) * 1e9; // Assuming 9 decimals
      const amountBN = new BN(amount);
      const result = await multistake.stake(poolPubkey, itemIndex, mintPubkey, amountBN);
      setOperationLogs(prev => [{ time: new Date().toLocaleTimeString(), operation: 'Stake', message: `Staked ${amount} tokens successfully` }, ...prev]);
      console.log('Stake successful!');
      setStakeAmount('');
    } catch (error) {
      setOperationLogs(prev => [{ time: new Date().toLocaleTimeString(), operation: 'Stake', message: `Failed: ${error}` }, ...prev]);
      console.error(`Failed to stake: ${error}`);
    } finally {
      setStaking(false);
    }
  };

  const handleUnstake = async () => {
    if (!multistake || !walletAddress) {
      console.error('Please check wallet connection, pool address and amount');
      return;
    }
    setUnstaking(true);
    try {
      const amount = parseFloat(stakeAmount) * 1e9; // Assuming 9 decimals
      const amountBN = new BN(amount);
      const result = await multistake.unstake(poolPubkey, itemIndex, mintPubkey, amountBN);
      setOperationLogs(prev => [{ time: new Date().toLocaleTimeString(), operation: 'Unstake', message: `Unstaked ${amount} tokens successfully` }, ...prev]);
      console.error('Unstake successful!');
      setStakeAmount('');
    } catch (error) {
      setOperationLogs(prev => [{ time: new Date().toLocaleTimeString(), operation: 'Unstake', message: `Failed: ${error}` }, ...prev]);
      console.error(`Failed to unstake: ${error}`);
    } finally {
      setUnstaking(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm text-slate-400 block mb-2">Pool Address</label>
        <div className="flex items-center gap-2 bg-black/20 rounded-lg p-3">
          <code className="text-indigo-300 text-sm flex-1 break-all">{solanaMapping.pool_address}</code>
          <a href={`https://solscan.io/account/${solanaMapping.pool_address}`} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300">
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
      <div>
        <label className="text-sm text-slate-400 block mb-2">Mint Address</label>
        <div className="flex items-center gap-2 bg-black/20 rounded-lg p-3">
          <code className="text-indigo-300 text-sm flex-1 break-all">{solanaMapping.mint_address}</code>
          <a href={`https://solscan.io/token/${solanaMapping.mint_address}`} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300">
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
      <div className='flex flex-row gap-2 w-full'>
        <div className='flex-1'>
          <label className="text-sm text-slate-400 block mb-2">Weight</label>
          <div className="flex items-center gap-2 bg-black/20 rounded-lg p-3">
            <code className="text-indigo-300 text-sm flex-1 break-all">{`${thisItemInfo.weight}`}</code>
          </div>
        </div>
        <div className='flex-1'>
          <label className="text-sm text-slate-400 block mb-2">Mint Amount</label>
          <div className="flex items-center gap-2 bg-black/20 rounded-lg p-3">
            <code className="text-indigo-300 text-sm flex-1 break-all">{`${thisItemInfo.mintAmount}`}</code>
          </div>
        </div>
      </div>
      <div>
        <label className="text-sm text-slate-400 block mb-2">Stake/Unstake</label>
        <div className="space-y-3">
          <input type="number" value={stakeAmount} onChange={(e) => setStakeAmount(e.target.value)} placeholder="Enter amount..."
            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 transition-colors" />
          <div className="flex gap-3">
            <button onClick={handleStake} disabled={staking || !walletAddress || !stakeAmount}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors">
              {staking ? 'Staking...' : 'Stake'}
            </button>
            <button onClick={handleUnstake} disabled={unstaking || !walletAddress || !stakeAmount}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors">
              {unstaking ? 'Unstaking...' : 'Unstake'}
            </button>
          </div>
        </div>
      </div>
      {operationLogs.length > 0 && (
        <div>
          <label className="text-sm text-slate-400 block mb-2">Operation Logs</label>
          <div className="bg-black/20 rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
            {operationLogs.map((log, index) => (
              <div key={index} className="border-b border-white/10 pb-2 last:border-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400">{log.time}</span>
                  <span className={`text-xs font-semibold ${log.operation === 'Stake' ? 'text-green-400' : 'text-red-400'}`}>{log.operation}</span>
                </div>
                <p className="text-sm text-white">{log.message}</p>
                {log.signature && <code className="text-xs text-indigo-300 break-all block mt-1">Tx: {log.signature}</code>}
              </div>
            ))}
          </div>
        </div>
      )}
      <PoolTokensList tokens={allPoolTokens} />
      <button onClick={() => {
        handleWrapSOL(multistake!.getProvider(), '100');
      }}>handle wsol</button>
    </div>
  );
};

const CreatePool: React.FC = () => {
  const [creatingPool, setCreatingPool] = useState(false);
  const { multistake, walletAddress } = useWeb3();
  const [poolResult, setPoolResult] = useState<{ pool: string; signature: string } | null>(null);

  const handleCreatePool = async () => {
    if (!multistake || !walletAddress) {
      console.error('Please connect your wallet first');
      return;
    }
    setCreatingPool(true);
    try {
      const result = await multistake.createPool(WSOL_MINT_ADDRESS, { feeNumerator: 0, feeDenominator: 10000 });
      setPoolResult({ pool: result.pool.toString(), signature: result.signature });
      console.error('Pool created successfully!');
    } finally {
      setCreatingPool(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-slate-300 text-sm">Create a new liquidity pool for trading tokens. This will create a pool paired with WSOL.</p>
      {!walletAddress ? (
        <div className="bg-amber-500/10 border border-amber-400/30 rounded-lg p-4">
          <p className="text-amber-300 text-center text-sm">Please connect your wallet to create a pool</p>
        </div>
      ) : (
        <button onClick={handleCreatePool} disabled={creatingPool}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors">
          {creatingPool ? 'Creating Pool...' : 'Create Pool'}
        </button>
      )}
      {poolResult && (
        <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-4 space-y-3">
          <p className="text-green-300 font-semibold">Pool Created Successfully!</p>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Pool Address</label>
            <code className="text-green-300 text-xs break-all block bg-black/20 p-2 rounded">{poolResult.pool}</code>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Transaction Signature</label>
            <code className="text-green-300 text-xs break-all block bg-black/20 p-2 rounded">{poolResult.signature}</code>
          </div>
        </div>
      )}
    </div>
  );
};

// AssignToPool Component
interface AssignToPoolProps {
  itemId: number;
  onAssignSuccess: () => void;
}

const AssignToPool: React.FC<AssignToPoolProps> = ({ itemId, onAssignSuccess }) => {
  const { multistake, walletAddress } = useWeb3();
  const [poolAddress, setPoolAddress] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [assignResult, setAssignResult] = useState<{ mint: string; signature: string } | null>(null);

  const handleAssignToPool = async () => {
    if (!multistake || !walletAddress || !poolAddress) {
      console.error('Please connect your wallet and enter a pool address');
      return;
    }

    setAssigning(true);
    try {
      const poolPubkey = new PublicKey(poolAddress);

      // Call SDK's addToken operation
      const result = await multistake.addTokenToPool(poolPubkey);

      // Save to database
      const response = await fetch(`${API_BASE_URL}/api/solana/assign-to-pool`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_id: itemId.toString(),
          pool_address: poolAddress,
          mint_address: result.lpMint.toString(),
          transaction_signature: result.signature,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save to database');
      }

      setAssignResult({ mint: result.lpMint.toString(), signature: result.signature });
      console.error('Token assigned to pool successfully!');
      onAssignSuccess();
    } catch (error) {
      console.error(`Failed to assign token: ${error}`);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-slate-300 text-sm">Assign this token to an existing liquidity pool by adding it as a new token.</p>
      {!walletAddress ? (
        <div className="bg-amber-500/10 border border-amber-400/30 rounded-lg p-4">
          <p className="text-amber-300 text-center text-sm">Please connect your wallet to assign token</p>
        </div>
      ) : (
        <div className="space-y-3">
          <input
            type="text"
            value={poolAddress}
            onChange={(e) => setPoolAddress(e.target.value)}
            placeholder="Enter pool address..."
            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 transition-colors"
          />
          <button
            onClick={handleAssignToPool}
            disabled={assigning || !poolAddress}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {assigning ? 'Assigning...' : 'Assign to Pool'}
          </button>
        </div>
      )}
      {assignResult && (
        <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-4 space-y-3">
          <p className="text-green-300 font-semibold">Token Assigned Successfully!</p>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Mint Address</label>
            <code className="text-green-300 text-xs break-all block bg-black/20 p-2 rounded">{assignResult.mint}</code>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Transaction Signature</label>
            <code className="text-green-300 text-xs break-all block bg-black/20 p-2 rounded">{assignResult.signature}</code>
          </div>
        </div>
      )}
    </div>
  );
};

// ========== Main Component ==========

const Web3MemorialPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { multistake } = useWeb3();
  const [item, setItem] = useState<ItemData | null>(null);
  const [solanaMapping, setSolanaMapping] = useState<SolanaMapping | null>(null);
  const [loading, setLoading] = useState(true);
  const [poolInfo, setPoolInfo] = useState<PoolInfo & { items: Array<TokenInfo> } | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/item/stats?item_id=${id}`);
        const data = await response.json();

        if (data.item) {
          setItem(data.item);
        }

        // 获取 Solana mapping
        const solanaResponse = await fetch(`${API_BASE_URL}/api/solana/mapping/${id}`);
        if (solanaResponse.ok) {
          const solanaData = await solanaResponse.json();
          if (solanaData.mapping) {
            setSolanaMapping(solanaData.mapping);
          }
        }
      } catch (error) {
        console.error('Failed to fetch item:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchItem();
    }
  }, [id]);

  // 获取 pool tokens
  useEffect(() => {
    const fetchPoolTokens = async () => {
      if (!multistake || !solanaMapping?.pool_address) {
        console.log('[fetchPoolTokens] Missing multistake or pool_address, skipping');
        return;
      }

      try {
        const poolPubkey = new PublicKey(solanaMapping.pool_address);
        const poolInfo = await multistake.getPoolInfo(poolPubkey);
        setPoolInfo(poolInfo);
      } catch (error) {
        console.error('[fetchPoolTokens] Error:', error);
      }
    };
    fetchPoolTokens();
  }, [multistake, solanaMapping, id]);

  // Refresh solana mapping after assignment
  const handleAssignSuccess = async () => {
    try {
      const solanaResponse = await fetch(`${API_BASE_URL}/api/solana/mapping/${id}`);
      if (solanaResponse.ok) {
        const solanaData = await solanaResponse.json();
        if (solanaData.mapping) {
          setSolanaMapping(solanaData.mapping);
        }
      }
    } catch (error) {
      console.error('Failed to refresh solana mapping:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Token not found</div>
      </div>
    );
  }

  const misc = typeof item.misc === 'string' ? JSON.parse(item.misc) : item.misc;
  const coverImage = misc?.coverImage;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        {coverImage ? (
          <img
            src={coverImage}
            alt={item.title}
            className="w-full h-full object-cover opacity-40"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-slate-900" />
        )}

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <Hexagon className="w-16 h-16 mx-auto mb-4 text-indigo-400" />
            <h1 className="text-5xl font-serif mb-2">{item.title}</h1>
            <p className="text-slate-300 text-lg">Heritage Token #{item.id}</p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Basic Info Card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 mb-8">
          <h2 className="text-2xl font-serif mb-4 flex items-center gap-2">
            <Globe className="w-6 h-6 text-indigo-400" />
            Basic Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400 block mb-1">Token Name</label>
              <p className="text-lg">{item.title}</p>
            </div>

            {item.description && (
              <div>
                <label className="text-sm text-slate-400 block mb-1">Description</label>
                <p className="text-slate-300 leading-relaxed">{item.description}</p>
              </div>
            )}

            <div>
              <label className="text-sm text-slate-400 block mb-1">Token ID</label>
              <p className="font-mono text-indigo-300">#{item.id}</p>
            </div>

            <div>
              <label className="text-sm text-slate-400 block mb-1">Created</label>
              <p className="text-slate-300">
                {new Date(item.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Pool Information - Show when assigned */}
        {solanaMapping && poolInfo ? (
          <>
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 mb-8">
              <h2 className="text-2xl font-serif mb-4 flex items-center gap-2">
                <Wallet className="w-6 h-6 text-indigo-400" />
                Pool Information
              </h2>
              <StakeUnstakePanel
                solanaMapping={solanaMapping}
                poolInfo={poolInfo}
              />
            </div>

            {/* <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 mb-8">
              <PoolTokensList tokens={allPoolTokens} />
            </div> */}
          </>
        ) : (
          /* Assign to Pool Block - Show when not assigned */
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 mb-8">
            <h2 className="text-2xl font-serif mb-4 flex items-center gap-2">
              <Hexagon className="w-6 h-6 text-indigo-400" />
              Assign to Pool
            </h2>
            <AssignToPool
              itemId={item.id}
              onAssignSuccess={handleAssignSuccess}
            />
          </div>
        )}

        {/* Create Pool Block */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 mb-8">
          <h2 className="text-2xl font-serif mb-4 flex items-center gap-2">
            <Hexagon className="w-6 h-6 text-indigo-400" />
            Create Pool
          </h2>
          <CreatePool />
        </div>

        {/* Web3 Notice */}
        <div className="bg-indigo-500/10 border border-indigo-400/30 rounded-xl p-6 text-center">
          <Wallet className="w-12 h-12 mx-auto mb-3 text-indigo-400" />
          <h3 className="text-lg font-semibold mb-2">Web3 Mode</h3>
          <p className="text-sm text-slate-300">
            You are viewing this token in read-only mode.
            Switch to Normal Mode to access full features including gallery, timeline, and tributes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Web3MemorialPage;