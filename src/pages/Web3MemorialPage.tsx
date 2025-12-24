import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Hexagon, Globe, Wallet, ExternalLink } from 'lucide-react';
import { useWeb3 } from '../context/Web3Context';
import { PublicKey } from '@solana/web3.js';


interface ItemData {
  id: number;
  title: string;
  description: string;
  misc: any;
  group_id: number;
  created_at: string;
}

interface SolanaMapping {
  mint_address: string | null;
  pool_address: string | null;
}

const WSOL_MINT_ADDRESS = new PublicKey('So11111111111111111111111111111111111111112');

const Web3MemorialPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { walletAddress, multistake } = useWeb3();
  const [item, setItem] = useState<ItemData | null>(null);
  const [solanaMapping, setSolanaMapping] = useState<SolanaMapping | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingPool, setCreatingPool] = useState(false);
  const [poolResult, setPoolResult] = useState<{ pool: string; signature: string } | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await fetch(`/api/item/stats?item_id=${id}`);
        const data = await response.json();

        if (data.item) {
          setItem(data.item);
        }

        // 获取 Solana mapping
        const solanaResponse = await fetch(`/api/solana/mapping/${id}`);
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

  const handleCreatePool = async () => {
    if (!multistake || !walletAddress) {
      alert('Please connect your wallet first');
      return;
    }

    setCreatingPool(true);
    try {
      console.log('Creating pool with MultiStakeSDK...');
      const result = await multistake.createPool(WSOL_MINT_ADDRESS, {
        feeNumerator: 0,
        feeDenominator: 10000,
      });

      setPoolResult({
        pool: result.pool.toString(),
        signature: result.signature
      });

      console.log('Pool created successfully:', result);
      alert('Pool created successfully!');
    } catch (error) {
      console.error('Failed to create pool:', error);
      alert(`Failed to create pool: ${error}`);
    } finally {
      setCreatingPool(false);
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

        {/* Solana NFT Info */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8 mb-8">
          <h2 className="text-2xl font-serif mb-4 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-indigo-400" />
            Solana NFT Status
          </h2>

          {!solanaMapping ? (
            <div className="bg-amber-500/10 border border-amber-400/30 rounded-lg p-4">
              <p className="text-amber-300 text-center">
                ⚠️ This token has not been minted on Solana yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {solanaMapping.mint_address && (
                <div>
                  <label className="text-sm text-slate-400 block mb-2">Mint Address</label>
                  <div className="flex items-center gap-2 bg-black/20 rounded-lg p-3">
                    <code className="text-indigo-300 text-sm flex-1 break-all">
                      {solanaMapping.mint_address}
                    </code>
                    <a
                      href={`https://solscan.io/token/${solanaMapping.mint_address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}

              {solanaMapping.pool_address && (
                <div>
                  <label className="text-sm text-slate-400 block mb-2">Pool Address</label>
                  <div className="flex items-center gap-2 bg-black/20 rounded-lg p-3">
                    <code className="text-indigo-300 text-sm flex-1 break-all">
                      {solanaMapping.pool_address}
                    </code>
                    <a
                      href={`https://solscan.io/account/${solanaMapping.pool_address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
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
