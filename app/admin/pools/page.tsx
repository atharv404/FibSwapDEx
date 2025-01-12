import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

const initialPools = [
  { id: 1, chain: "Ethereum", token: "USDC", address: "0x...", balance: "1,000,000", maxSwapAmount: "100,000" },
  { id: 2, chain: "Ethereum", token: "USDT", address: "0x...", balance: "500,000", maxSwapAmount: "50,000" },
  { id: 3, chain: "Polygon", token: "USDC", address: "0x...", balance: "750,000", maxSwapAmount: "75,000" },
  { id: 4, chain: "BSC", token: "USDC", address: "0x...", balance: "1,250,000", maxSwapAmount: "125,000" },
]

export default function PoolsPage() {
  const [pools, setPools] = useState(initialPools)
  const [liquidityAmount, setLiquidityAmount] = useState("")
  const [maxSwapAmount, setMaxSwapAmount] = useState("")

  const handleAddLiquidity = (poolId: number) => {
    setPools(pools.map(pool => 
      pool.id === poolId 
        ? {...pool, balance: (parseFloat(pool.balance.replace(/,/g, '')) + parseFloat(liquidityAmount)).toLocaleString()} 
        : pool
    ))
    setLiquidityAmount("")
  }

  const handleRemoveLiquidity = (poolId: number) => {
    setPools(pools.map(pool => 
      pool.id === poolId 
        ? {...pool, balance: (parseFloat(pool.balance.replace(/,/g, '')) - parseFloat(liquidityAmount)).toLocaleString()} 
        : pool
    ))
    setLiquidityAmount("")
  }

  const handleUpdateMaxSwap = (poolId: number) => {
    setPools(pools.map(pool => 
      pool.id === poolId 
        ? {...pool, maxSwapAmount} 
        : pool
    ))
    setMaxSwapAmount("")
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Pools Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>Active Pools</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Chain</TableHead>
                <TableHead>Token</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Max Swap Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pools.map((pool) => (
                <TableRow key={pool.id}>
                  <TableCell>{pool.chain}</TableCell>
                  <TableCell>{pool.token}</TableCell>
                  <TableCell>{pool.address}</TableCell>
                  <TableCell>{pool.balance}</TableCell>
                  <TableCell>{pool.maxSwapAmount}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Input 
                        type="number" 
                        placeholder="Amount" 
                        value={liquidityAmount}
                        onChange={(e) => setLiquidityAmount(e.target.value)}
                        className="w-24"
                      />
                      <Button onClick={() => handleAddLiquidity(pool.id)}>Add</Button>
                      <Button onClick={() => handleRemoveLiquidity(pool.id)} variant="destructive">Remove</Button>
                    </div>
                    <div className="flex space-x-2 mt-2">
                      <Input 
                        type="number" 
                        placeholder="Max Swap" 
                        value={maxSwapAmount}
                        onChange={(e) => setMaxSwapAmount(e.target.value)}
                        className="w-24"
                      />
                      <Button onClick={() => handleUpdateMaxSwap(pool.id)}>Update Max</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

