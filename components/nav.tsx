import Link from "next/link"
import { Logo } from "./logo"

export function Nav() {
  return (
    <nav className="flex justify-between items-center p-4">
      <Logo />
      <div className="flex gap-4">
        <Link 
          href="/buy-fibo" 
          className="text-white/90 hover:text-white border border-white/20 px-4 py-1 rounded transition hover:bg-white/10"
        >
          Buy FIBO
        </Link>
        <Link 
          href="/buy-orio"
          className="text-white/90 hover:text-white border border-white/20 px-4 py-1 rounded transition hover:bg-white/10"
        >
          Buy ORIO
        </Link>
      </div>
    </nav>
  )
}

