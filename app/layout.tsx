import type { Metadata } from "next"
import { Rubik } from 'next/font/google'
import "./globals.css"
import { Providers } from "./providers"

const rubik = Rubik({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FibSwapDex",
  description: "Your endpoint to do cross chain swaps",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={rubik.className}>
        <Providers>
          <div className="min-h-screen bg-gradient-to-br from-[#2E2B7C] to-[#1E4D9C]">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}

