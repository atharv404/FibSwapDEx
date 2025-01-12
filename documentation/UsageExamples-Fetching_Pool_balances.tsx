import { usePoolBalance } from '@/hooks/useTokenPoolContract';
import { NETWORKS } from '@/config/contracts';

export function PoolBalances() {
  return (
    <div className="grid gap-4">
      {Object.entries(NETWORKS).map(([network, config]) => (
        <div key={network} className="p-4 border rounded-lg">
          <h3 className="text-lg font-bold">{config.name}</h3>
          <PoolBalance 
            token={config.tokens.USDC.address} 
            chainId={config.chainId} 
          />
        </div>
      ))}
    </div>
  );
}

function PoolBalance({ token, chainId }: { token: string; chainId: number }) {
  const { balance, isLoading, isError } = usePoolBalance({ token, chainId });

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching balance</div>;

  return (
    <div className="mt-2">
      <span className="text-2xl font-mono">{balance}</span> USDC
    </div>
  );
}