import { useCallback, useMemo } from 'react';
import { useContractRead, useContractWrite, useAccount, useNetwork } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { TokenPoolABI, ERC20ABI } from '@/config/abis';
import { NETWORKS, CONTRACTS } from '@/config/contracts';

export function useTokenPool() {
  const { address } = useAccount();
  const { chain } = useNetwork();

  const contract = useMemo(() => {
    if (!chain) return null;
    
    const network = Object.entries(NETWORKS).find(
      ([, config]) => config.chainId === chain.id
    )?.[0];
    
    if (!network) return null;

    return {
      address: CONTRACTS.tokenPool[network],
      abi: TokenPoolABI
    };
  }, [chain]);

  // Get fee quote for swap
  const getFeeQuote = useCallback(async ({
    amount,
    dstChainId,
    toAddress
  }: {
    amount: string;
    dstChainId: number;
    toAddress: string;
  }) => {
    if (!contract) throw new Error('Chain not supported');

    const parsedAmount = parseUnits(amount, 6); // USDC/USDT decimals

    // Get base fee
    const { data: baseFee } = await useContractRead({
      ...contract,
      functionName: 'calculateFee',
      args: [parsedAmount]
    });

    // Get LayerZero fee
    const { data: lzFee } = await useContractRead({
      ...contract,
      functionName: 'estimateSendFee',
      args: [dstChainId, toAddress, parsedAmount, false, '0x']
    });

    return {
      baseFee: formatUnits(baseFee || 0n, 6),
      lzFee: formatUnits(lzFee || 0n, 6),
      totalFee: formatUnits((baseFee || 0n) + (lzFee || 0n), 6)
    };
  }, [contract]);

  // Check token allowance and approve if needed
  const checkAndApproveToken = useCallback(async ({
    token,
    amount
  }: {
    token: string;
    amount: string;
  }) => {
    if (!address || !contract) throw new Error('Wallet not connected');

    const parsedAmount = parseUnits(amount, 6);

    // Check current allowance
    const { data: allowance } = await useContractRead({
      address: token,
      abi: ERC20ABI,
      functionName: 'allowance',
      args: [address, contract.address]
    });

    // If allowance is insufficient, approve
    if ((allowance || 0n) < parsedAmount) {
      const { writeAsync: approve } = useContractWrite({
        address: token,
        abi: ERC20ABI,
        functionName: 'approve'
      });

      const tx = await approve({
        args: [contract.address, parsedAmount]
      });
      await tx.wait();
    }
  }, [address, contract]);

  // Execute swap
  const executeSwap = useCallback(async ({
    dstChainId,
    toAddress,
    token,
    amount
  }: {
    dstChainId: number;
    toAddress: string;
    token: string;
    amount: string;
  }) => {
    if (!contract || !address) throw new Error('Not ready');

    const parsedAmount = parseUnits(amount, 6);

    // First check and approve token if needed
    await checkAndApproveToken({ token, amount });

    // Get LayerZero fee
    const { data: [nativeFee] } = await useContractRead({
      ...contract,
      functionName: 'estimateSendFee',
      args: [dstChainId, toAddress, parsedAmount, false, '0x']
    });

    // Execute swap
    const { writeAsync: sendTokens } = useContractWrite({
      ...contract,
      functionName: 'sendTokens'
    });

    const tx = await sendTokens({
      args: [
        dstChainId,
        toAddress,
        token,
        parsedAmount,
        address, // refund address
        ethers.constants.AddressZero, // zroPaymentAddress
        '0x' // adapterParams
      ],
      value: nativeFee // LayerZero fee in native token
    });

    return tx;
  }, [contract, address, checkAndApproveToken]);

  return {
    getFeeQuote,
    executeSwap
  };
}