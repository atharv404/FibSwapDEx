import { useCallback } from 'react';
import { useContractWrite, useWaitForTransaction } from 'wagmi';
import { parseUnits } from 'viem';
import { useTokenPoolContract } from './useTokenPoolContract';

export function useAdminActions(chainId: number) {
  const contract = useTokenPoolContract(chainId);

  // Update base fee percentage
  const { 
    writeAsync: updateBaseFee,
    data: updateFeeData,
    isLoading: isUpdatingFee 
  } = useContractWrite({
    ...contract,
    functionName: 'setBaseFeePercent',
  });

  // Wait for fee update transaction
  const { 
    isLoading: isWaitingFee,
    isSuccess: feeUpdateSuccess 
  } = useWaitForTransaction({
    hash: updateFeeData?.hash,
  });

  // Set new fee percentage
  const setNewFeePercentage = useCallback(async (percentage: number) => {
    if (!contract) throw new Error('Contract not found');
    
    try {
      const tx = await updateBaseFee({
        args: [parseUnits(percentage.toString(), 2)], // Expects percentage * 100
      });
      return tx;
    } catch (error) {
      console.error('Failed to update fee:', error);
      throw error;
    }
  }, [contract, updateBaseFee]);

  // Emergency pause
  const { 
    writeAsync: pausePool,
    data: pauseData,
    isLoading: isPausing 
  } = useContractWrite({
    ...contract,
    functionName: 'pause',
  });

  // Emergency unpause
  const { 
    writeAsync: unpausePool,
    data: unpauseData,
    isLoading: isUnpausing 
  } = useContractWrite({
    ...contract,
    functionName: 'unpause',
  });

  return {
    setNewFeePercentage,
    pausePool,
    unpausePool,
    isUpdatingFee: isUpdatingFee || isWaitingFee,
    isPausing,
    isUnpausing,
    feeUpdateSuccess,
  };
}