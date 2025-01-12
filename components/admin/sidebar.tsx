import Link from "next/link"
import { Home, DollarSign, Settings, Activity } from 'lucide-react'

const navItems = [
  { href: "/admin", icon: Home, label: "Dashboard" },
  { href: "/admin/pools", icon: DollarSign, label: "Pools" },
  { href: "/admin/fees", icon: Settings, label: "Fees" },
  { href: "/admin/transactions", icon: Activity, label: "Transactions" },
]

export function Sidebar() {
  return (
    <div className="w-64 bg-white h-full shadow-lg">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-800">FibSwap Admin</h1>
      </div>
      <nav className="mt-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center px-6 py-3 text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  )
}

