import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const initialFees = [
  { id: 1, chain: "Ethereum", token: "USDC", baseFee: "0.1%", discountedFee: "0.08%", lzFee: "0.05%" },
  { id: 2, chain: "Ethereum", token: "USDT", baseFee: "0.1%", discountedFee: "0.08%", lzFee: "0.05%" },
  { id: 3, chain: "Polygon", token: "USDC", baseFee: "0.15%", discountedFee: "0.12%", lzFee: "0.07%" },
  { id: 4, chain: "BSC", token: "USDC", baseFee: "0.12%", discountedFee: "0.1%", lzFee: "0.06%" },
]

export default function FeesPage() {
  const [fees, setFees] = useState(initialFees)
  const [newBaseFee, setNewBaseFee] = useState("")
  const [newDiscountedFee, setNewDiscountedFee] = useState("")

  const handleUpdateFees = (feeId: number) => {
    setFees(fees.map(fee => 
      fee.id === feeId 
        ? {...fee, baseFee: `${newBaseFee}%`, discountedFee: `${newDiscountedFee}%`} 
        : fee
    ))
    setNewBaseFee("")
    setNewDiscountedFee("")
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Fees Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>Current Fees</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Chain</TableHead>
                <TableHead>Token</TableHead>
                <TableHead>Base Fee</TableHead>
                <TableHead>Discounted Fee</TableHead>
                <TableHead>LayerZero Fee</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fees.map((fee) => (
                <TableRow key={fee.id}>
                  <TableCell>{fee.chain}</TableCell>
                  <TableCell>{fee.token}</TableCell>
                  <TableCell>{fee.baseFee}</TableCell>
                  <TableCell>{fee.discountedFee}</TableCell>
                  <TableCell>{fee.lzFee}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Input 
                        type="number" 
                        placeholder="Base Fee" 
                        value={newBaseFee}
                        onChange={(e) => setNewBaseFee(e.target.value)}
                        className="w-24"
                      />
                      <Input 
                        type="number" 
                        placeholder="Discounted Fee" 
                        value={newDiscountedFee}
                        onChange={(e) => setNewDiscountedFee(e.target.value)}
                        className="w-24"
                      />
                      <Button onClick={() => handleUpdateFees(fee.id)}>Update</Button>
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

