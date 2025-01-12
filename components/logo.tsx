import Image from 'next/image'
import Link from 'next/link'

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <Image
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/08fd2e42-4a66-4a0e-9d61-97ce13eb9303-removebg-preview-BSWXcBodk9XWqqnoXMZLnLGKkJWKEK.png"
        alt="FibSwapDEx Logo"
        width={40}
        height={40}
        className="object-contain"
      />
      <span className="text-2xl font-bold text-white">
        Fib<span className="text-3xl">SWAP</span>DEx
      </span>
    </Link>
  )
}

