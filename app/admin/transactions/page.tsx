import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const transactions = [
  { id: 1, hash: "0x...", sourceChain: "Ethereum", targetChain: "Polygon", token: "USDC", amount: "1000", status: "Completed" },
  { id: 2, hash: "0x...", sourceChain: "BSC", targetChain: "Ethereum", token: "USDC", amount: "500", status: "Pending" },
  { id: 3, hash: "0x...", sourceChain: "Ethereum", targetChain: "BSC", token: "USDT", amount: "750", status: "Completed" },
  { id: 4, hash: "0x...", sourceChain: "Polygon", targetChain: "Ethereum", token: "USDC", amount: "250", status: "Failed" },
]

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Transactions Monitoring</h1>
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hash</TableHead>
                <TableHead>Source Chain</TableHead>
                <TableHead>Target Chain</TableHead>
                <TableHead>Token</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell>{tx.hash}</TableCell>
                  <TableCell>{tx.sourceChain}</TableCell>
                  <TableCell>{tx.targetChain}</TableCell>
                  <TableCell>{tx.token}</TableCell>
                  <TableCell>{tx.amount}</TableCell>
                  <TableCell>{tx.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

