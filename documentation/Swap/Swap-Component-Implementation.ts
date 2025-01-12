import { useState, useCallback } from 'react';
import { useAccount, useNetwork } from 'wagmi';
import { useTokenPool } from '@/hooks/useTokenPool';
import { NETWORKS, SUPPORTED_TOKENS } from '@/config/contracts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

export function SwapForm() {
  const { address } = useAccount();
  const { chain } = useNetwork();
  const { getFeeQuote, executeSwap } = useTokenPool();
  const { toast } = useToast();

  const [sourceChain, setSourceChain] = useState('ethereum');
  const [targetChain, setTargetChain] = useState('polygon');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quote, setQuote] = useState(null);

  // Get quote when amount changes
  const handleGetQuote = useCallback(async () => {
    if (!amount || !chain) return;

    try {
      const targetChainId = NETWORKS[targetChain].lzChainId;
      const recipientAddress = recipient || address;

      const feeQuote = await getFeeQuote({
        amount,
        dstChainId: targetChainId,
        toAddress: recipientAddress
      });

      setQuote(feeQuote);
    } catch (error) {
      console.error('Error getting quote:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    }
  }, [amount, chain, targetChain, recipient, address, getFeeQuote, toast]);

  // Execute swap
  const handleSwap = async () => {
    if (!amount || !chain || !quote) return;

    try {
      setIsLoading(true);

      const targetChainId = NETWORKS[targetChain].lzChainId;
      const recipientAddress = recipient || address;
      const token = SUPPORTED_TOKENS.USDC.addresses[sourceChain];

      const tx = await executeSwap({
        dstChainId: targetChainId,
        toAddress: recipientAddress,
        token,
        amount
      });

      toast({
        title: "Swap Initiated",
        description: `Transaction Hash: ${tx.hash}`,
      });

      // Wait for confirmation
      await tx.wait();

      toast({
        title: "Swap Confirmed",
        description: "Your tokens are on the way!",
      });

    } catch (error) {
      console.error('Swap failed:', error);
      toast({
        variant: "destructive",
        title: "Swap Failed",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Chain Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">