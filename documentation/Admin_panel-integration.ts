import { useCallback, useEffect, useState } from 'react';
import { useContractReads, useContractWrite } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { NETWORKS, type SupportedNetwork } from '@/config/contracts';
import { useTokenPoolContract } from './useTokenPoolContract';

export interface PoolStats {
  chainId: number;
  network: SupportedNetwork;
  balance: string;
  feeCollected: string;
  totalVolume: string;
  transactions: number;
}

export function useAdminPoolData() {
  const [stats, setStats] = useState<PoolStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch data for all pools
  const fetchAllPoolsData = useCallback(async () => {
    try {
      setIsLoading(true);
      const poolStats: PoolStats[] = [];

      for (const [network, config] of Object.entries(NETWORKS)) {
        const contract = useTokenPoolContract(config.chainId);
        if (!contract) continue;

        const data = await Promise.all([
          // Get pool balance
          contract.read.getTokenBalance([config.tokens.USDC.address]),
          // Get fee collected
          contract.read.getFeeCollected(),
          // Get total volume
          contract.read.getTotalVolume(),
          // Get transaction count
          contract.read.getTransactionCount(),
        ]);

        poolStats.push({
          chainId: config.chainId,
          network: network as SupportedNetwork,
          balance: formatUnits(data[0], 6),
          feeCollected: formatUnits(data[1], 6),
          totalVolume: formatUnits(data[2], 6),
          transactions: Number(data[3]),
        });
      }

      setStats(poolStats);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch pool data'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllPoolsData();
    // Set up polling interval
    const interval = setInterval(fetchAllPoolsData, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [fetchAllPoolsData]);

  return { stats, isLoading, error, refetch: fetchAllPoolsData };
}