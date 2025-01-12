export class ContractError extends Error {
    constructor(
      message: string,
      public readonly code?: string,
      public readonly transaction?: string
    ) {
      super(message);
      this.name = 'ContractError';
    }
  }
  
  export function handleContractError(error: any): ContractError {
    // Parse error message from contract
    const message = error.message || 'Unknown contract error';
    
    // Extract error code if available
    const code = error.code || 'UNKNOWN_ERROR';
    
    // Get transaction hash if available
    const transaction = error.transaction?.hash;
    
    return new ContractError(message, code, transaction);
  }