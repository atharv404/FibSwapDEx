'use client'

import { useState } from 'react'
import { parseUnits } from 'viem'
import { type Address } from 'wagmi'
import { readContract, writeContract, getAccount, switchChain } from 'wagmi/actions'
import { CONTRACTS, NETWORKS } from '@/config/contracts'
import { config } from '@/config/wagmi'

export function useSwap() {
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState<Address>()
  const [targetChain, setTargetChain] = useState<keyof typeof NETWORKS>('ethereum')
  
  const account = getAccount()
  const chain = config.chains.find((x) => x.id === account.chainId)

  const calculateFees = async () => {
    if (!amount || !chain?.id) return null

    try {
      const baseFee = await readContract(config, {
        address: CONTRACTS.feeManager,
        abi: [{
          name: 'calculateFee',
          type: 'function',
          inputs: [{ name: 'amount', type: 'uint256' }],
          outputs: [{ name: 'fee', type: 'uint256' }]
        }],
        functionName: 'calculateFee',
        args: [parseUnits(amount, 6)]
      })

      const currentNetwork = chain.id === 1 ? 'ethereum' : chain.id === 56 ? 'bsc' : 'polygon'
      const lzFee = await readContract(config, {
        address: CONTRACTS.tokenPool[currentNetwork],
        abi: [{
          name: 'estimateSendFee',
          type: 'function',
          inputs: [
            { name: 'targetChainId', type: 'uint16' },
            { name: 'recipient', type: 'address' },
            { name: 'amount', type: 'uint256' },
            { name: 'useZro', type: 'bool' },
            { name: 'adapterParams', type: 'bytes' }
          ],
          outputs: [{ name: 'fee', type: 'uint256' }]
        }],
        functionName: 'estimateSendFee',
        args: [
          NETWORKS[targetChain].lzChainId,
          recipient || account.address || '0x',
          parseUnits(amount, 6),
          false,
          '0x'
        ]
      })

      return { baseFee, lzFee }
    } catch (error) {
      console.error('Error calculating fees:', error)
      return null
    }
  }

  const approve = async () => {
    if (!amount || !chain?.id || !account.address) return

    const currentNetwork = chain.id === 1 ? 'ethereum' : chain.id === 56 ? 'bsc' : 'polygon'
    
    return writeContract(config, {
      address: NETWORKS[currentNetwork].tokens.USDC,
      abi: [{
        name: 'approve',
        type: 'function',
        inputs: [
          { name: 'spender', type: 'address' },
          { name: 'amount', type: 'uint256' }
        ],
        outputs: [{ name: 'success', type: 'bool' }]
      }],
      functionName: 'approve',
      args: [CONTRACTS.tokenPool[currentNetwork], parseUnits(amount, 6)]
    })
  }

  const swap = async () => {
    if (!amount || !chain?.id || !account.address) return

    const currentNetwork = chain.id === 1 ? 'ethereum' : chain.id === 56 ? 'bsc' : 'polygon'
    
    return writeContract(config, {
      address: CONTRACTS.tokenPool[currentNetwork],
      abi: [{
        name: 'sendTokens',
        type: 'function',
        inputs: [
          { name: 'targetChainId', type: 'uint16' },
          { name: 'recipient', type: 'address' },
          { name: 'token', type: 'address' },
          { name: 'amount', type: 'uint256' },
          { name: 'refundAddress', type: 'address' },
          { name: 'zroPaymentAddress', type: 'address' },
          { name: 'adapterParams', type: 'bytes' }
        ]
      }],
      functionName: 'sendTokens',
      args: [
        NETWORKS[targetChain].lzChainId,
        recipient || account.address,
        NETWORKS[currentNetwork].tokens.USDC,
        parseUnits(amount, 6),
        account.address,
        '0x',
        '0x'
      ]
    })
  }

  return {
    amount,
    setAmount,
    recipient,
    setRecipient,
    targetChain,
    setTargetChain,
    calculateFees,
    approve,
    swap,
    switchChain
  }
}

