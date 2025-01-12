import { Nav } from "@/components/nav"
import { ExchangeWidget } from "@/components/exchange-widget"

export default function Home() {
  return (
    <main>
      <Nav />
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Welcome to FibSwapDex
          </h1>
          <p className="text-[#4EEEB1]">
            Your endpoint to do cross chain swaps
          </p>
        </div>
        <ExchangeWidget />
      </div>
    </main>
  )
}

