import { useContractEvent } from 'wagmi';
import { useTokenPoolContract } from './useTokenPoolContract';

export function usePoolEvents(chainId: number) {
  const contract = useTokenPoolContract(chainId);

  // Listen for transfer events
  useContractEvent({
    ...contract,
    eventName: 'TokensSent',
    listener(log) {
      console.log('New transfer:', log);
      // Handle the event
    },
  });

  // Listen for fee updates
  useContractEvent({
    ...contract,
    eventName: 'BaseFeeUpdated',
    listener(log) {
      console.log('Fee updated:', log);
      // Handle the event
    },
  });

  // Listen for emergency events
  useContractEvent({
    ...contract,
    eventName: 'Paused',
    listener(log) {
      console.log('Pool paused:', log);
      // Handle the event
    },
  });
}