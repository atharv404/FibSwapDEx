'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Settings, MessageSquare } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { NETWORKS } from "@/config/contracts"
import { useState } from "react"
import Image from "next/image"

const SUPPORTED_TOKENS = {
  ethereum: ['USDC', 'USDT'],
  polygon: ['USDC'],
  bsc: ['USDC']
}

const CHAIN_ICONS = {
  ethereum: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
  polygon: "https://cryptologos.cc/logos/polygon-matic-logo.png",
  bsc: "https://cryptologos.cc/logos/bnb-bnb-logo.png"
}

export function ExchangeWidget() {
  const [amount, setAmount] = useState('')
  const [sourceChain, setSourceChain] = useState<string>('ethereum')
  const [targetChain, setTargetChain] = useState<string>('polygon')
  const [sourceToken, setSourceToken] = useState<string>('USDC')
  const [targetToken, setTargetToken] = useState<string>('USDC')
  const [receivingAddress, setReceivingAddress] = useState('')
  const [isConnected, setIsConnected] = useState(false)

  const handleConnect = () => {
    // Placeholder for wallet connection logic
    setIsConnected(true)
  }

  const handleDisconnect = () => {
    // Placeholder for wallet disconnection logic
    setIsConnected(false)
  }

  const handleSwap = () => {
    // Placeholder for swap logic
    console.log('Swap initiated', { 
      amount, 
      sourceChain, 
      targetChain, 
      sourceToken, 
      targetToken,
      receivingAddress: receivingAddress || 'default wallet'
    })
  }

  return (
    <Card className="w-full max-w-md bg-black/80 text-white border-0">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        {isConnected ? (
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              className="text-white/70 hover:text-white"
              onClick={handleDisconnect}
            >
              0x1234...5678
            </Button>
            <span className="text-sm text-white/70">
              on {NETWORKS[sourceChain].name}
              <Image
                src={CHAIN_ICONS[sourceChain]}
                alt={NETWORKS[sourceChain].name}
                width={16}
                height={16}
                className="inline-block ml-1 rounded-full"
              />
            </span>
          </div>
        ) : (
          <Button 
            variant="ghost" 
            className="text-white/70 hover:text-white"
            onClick={handleConnect}
          >
            Connect wallet
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Exchange</h2>
          <Button variant="ghost" size="icon" className="text-white/70 hover:text-white">
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-white/70">From</label>
            <div className="flex space-x-2">
              <Select
                value={sourceChain}
                onValueChange={(value) => {
                  setSourceChain(value)
                  setSourceToken(SUPPORTED_TOKENS[value as keyof typeof SUPPORTED_TOKENS][0])
                }}
              >
                <SelectTrigger className="w-full bg-white/10 border-0 text-white">
                  <SelectValue placeholder="Select chain">
                    {sourceChain && (
                      <div className="flex items-center gap-2">
                        <Image
                          src={CHAIN_ICONS[sourceChain as keyof typeof CHAIN_ICONS]}
                          alt={sourceChain}
                          width={20}
                          height={20}
                          className="rounded-full"
                        />
                        {NETWORKS[sourceChain as keyof typeof NETWORKS].name}
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(NETWORKS).map(([key, network]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <Image
                          src={CHAIN_ICONS[key as keyof typeof CHAIN_ICONS]}
                          alt={network.name}
                          width={20}
                          height={20}
                          className="rounded-full"
                        />
                        {network.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={sourceToken}
                onValueChange={setSourceToken}
              >
                <SelectTrigger className="w-full bg-white/10 border-0 text-white">
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_TOKENS[sourceChain as keyof typeof SUPPORTED_TOKENS].map((token) => (
                    <SelectItem key={token} value={token}>
                      {token}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/70">To</label>
            <div className="flex space-x-2">
              <Select
                value={targetChain}
                onValueChange={(value) => {
                  setTargetChain(value)
                  setTargetToken(SUPPORTED_TOKENS[value as keyof typeof SUPPORTED_TOKENS][0])
                }}
              >
                <SelectTrigger className="w-full bg-white/10 border-0 text-white">
                  <SelectValue placeholder="Select chain">
                    {targetChain && (
                      <div className="flex items-center gap-2">
                        <Image
                          src={CHAIN_ICONS[targetChain as keyof typeof CHAIN_ICONS]}
                          alt={targetChain}
                          width={20}
                          height={20}
                          className="rounded-full"
                        />
                        {NETWORKS[targetChain as keyof typeof NETWORKS].name}
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(NETWORKS).map(([key, network]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <Image
                          src={CHAIN_ICONS[key as keyof typeof CHAIN_ICONS]}
                          alt={network.name}
                          width={20}
                          height={20}
                          className="rounded-full"
                        />
                        {network.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={targetToken}
                onValueChange={setTargetToken}
              >
                <SelectTrigger className="w-full bg-white/10 border-0 text-white">
                  <SelectValue placeholder="Select token" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPORTED_TOKENS[targetChain as keyof typeof SUPPORTED_TOKENS].map((token) => (
                    <SelectItem key={token} value={token}>
                      {token}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/70">Send</label>
            <div className="relative">
              <Input 
                type="number" 
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-white/10 border-0 text-white pl-8"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/70">0</span>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70">
                ${amount ? (Number(amount) * 1).toFixed(2) : '0.00'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-white/70">Receiving Address (Optional)</label>
            <Input 
              type="text" 
              placeholder="Enter receiving address or leave empty for connected wallet"
              value={receivingAddress}
              onChange={(e) => setReceivingAddress(e.target.value)}
              className="w-full bg-white/10 border-0 text-white"
            />
          </div>
        </div>

        <div className="flex gap-2">
          {isConnected ? (
            <Button 
              className="w-full bg-[#4F6EF7] hover:bg-[#4F6EF7]/90 text-white"
              onClick={handleSwap}
              disabled={!amount}
            >
              Swap
            </Button>
          ) : (
            <Button 
              className="w-full bg-[#4F6EF7] hover:bg-[#4F6EF7]/90 text-white"
              onClick={handleConnect}
            >
              Connect wallet
            </Button>
          )}
          <Button variant="ghost" size="icon" className="text-white/70 hover:text-white">
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

