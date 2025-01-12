import { useState } from 'react';
import { useAdminActions } from '@/hooks/useAdminActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

export function FeeManager({ chainId }: { chainId: number }) {
  const [newFee, setNewFee] = useState('');
  const { setNewFeePercentage, isUpdatingFee, feeUpdateSuccess } = useAdminActions(chainId);
  const { toast } = useToast();

  const handleUpdateFee = async () => {
    try {
      await setNewFeePercentage(Number(newFee));
      toast({
        title: "Fee Updated",
        description: `Base fee has been updated to ${newFee}%`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update fee",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          type="number"
          value={newFee}
          onChange={(e) => setNewFee(e.target.value)}
          placeholder="New fee percentage"
          min="0"
          max="100"
          step="0.01"
        />
        <Button 
          onClick={handleUpdateFee}
          disabled={isUpdatingFee || !newFee}
        >
          {isUpdatingFee ? "Updating..." : "Update Fee"}
        </Button>
      </div>
    </div>
  );
}