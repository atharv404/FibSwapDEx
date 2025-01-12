import { useCallback, useMemo } from 'react';
import { useContractRead, useContractWrite, useNetwork } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { CONTRACTS, NETWORKS, type SupportedNetwork } from '@/config/contracts';
import { TokenPoolABI } from '@/config/abis';

export function useTokenPoolContract(chainId?: number) {
  const { chain } = useNetwork();
  const currentChainId = chainId || chain?.id;

  const contract = useMemo(() => {
    const network = Object.entries(NETWORKS).find(
      ([, config]) => config.chainId === currentChainId
    )?.[0] as SupportedNetwork | undefined;

    if (!network) return null;

    return {
      address: CONTRACTS.tokenPool[network],
      abi: TokenPoolABI,
    };
  }, [currentChainId]);

  return contract;
}

// Hook for fetching pool balances
export function usePoolBalance({ token, chainId }: { token: string; chainId: number }) {
  const contract = useTokenPoolContract(chainId);

  const { data, isError, isLoading, refetch } = useContractRead({
    ...contract,
    functionName: 'getTokenBalance',
    args: [token],
    enabled: !!contract,
    watch: true,
  });

  return {
    balance: data ? formatUnits(data, 6) : '0',
    isError,
    isLoading,
    refetch,
  };
}

// Hook for fetching base fee
export function useBaseFee({ amount, chainId }: { amount: string; chainId: number }) {
  const contract = useTokenPoolContract(chainId);

  const { data, isError, isLoading } = useContractRead({
    ...contract,
    functionName: 'calculateFee',
    args: [parseUnits(amount, 6)],
    enabled: !!contract && !!amount,
  });

  return {
    fee: data ? formatUnits(data, 6) : '0',
    isError,
    isLoading,
  };
}