// State Machine for Financial Operations
// Manages execution state transitions with validation and rollback

export type ExecutionState =
  | 'PENDING'
  | 'VALIDATING'
  | 'EXECUTING'
  | 'COMPLETED'
  | 'FAILED'
  | 'ROLLED_BACK';

export type ExecutionEvent =
  | 'START_VALIDATION'
  | 'VALIDATION_SUCCESS'
  | 'VALIDATION_FAILURE'
  | 'START_EXECUTION'
  | 'EXECUTION_SUCCESS'
  | 'EXECUTION_FAILURE'
  | 'ROLLBACK';

interface StateTransition {
  from: ExecutionState;
  to: ExecutionState;
  event: ExecutionEvent;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface StateMachineConfig {
  initialState: ExecutionState;
  onStateChange?: (transition: StateTransition) => void;
  onError?: (error: Error, state: ExecutionState) => void;
}

export class ExecutionStateMachine {
  private currentState: ExecutionState;
  private transitions: StateTransition[] = [];
  private config: StateMachineConfig;

  // Valid state transitions
  private static readonly VALID_TRANSITIONS: Record<ExecutionState, ExecutionState[]> = {
    PENDING: ['VALIDATING'],
    VALIDATING: ['EXECUTING', 'FAILED'],
    EXECUTING: ['COMPLETED', 'FAILED'],
    COMPLETED: [],
    FAILED: ['ROLLED_BACK', 'PENDING'],
    ROLLED_BACK: []
  };

  constructor(config: StateMachineConfig = { initialState: 'PENDING' }) {
    this.currentState = config.initialState;
    this.config = config;
  }

  /**
   * Transition to a new state
   */
  transition(event: ExecutionEvent, metadata?: Record<string, any>): boolean {
    const nextState = this.getNextState(event);

    if (!nextState) {
      const error = new Error(
        `Invalid transition: ${event} from state ${this.currentState}`
      );
      this.config.onError?.(error, this.currentState);
      return false;
    }

    // Validate transition is allowed
    const allowedTransitions = ExecutionStateMachine.VALID_TRANSITIONS[this.currentState];
    if (!allowedTransitions.includes(nextState)) {
      const error = new Error(
        `Transition to ${nextState} not allowed from ${this.currentState}`
      );
      this.config.onError?.(error, this.currentState);
      return false;
    }

    // Create transition record
    const transition: StateTransition = {
      from: this.currentState,
      to: nextState,
      event,
      timestamp: new Date(),
      metadata
    };

    this.transitions.push(transition);
    this.currentState = nextState;

    // Notify state change
    this.config.onStateChange?.(transition);

    return true;
  }

  /**
   * Get next state based on event
   */
  private getNextState(event: ExecutionEvent): ExecutionState | null {
    switch (event) {
      case 'START_VALIDATION':
        return this.currentState === 'PENDING' ? 'VALIDATING' : null;

      case 'VALIDATION_SUCCESS':
        return this.currentState === 'VALIDATING' ? 'EXECUTING' : null;

      case 'VALIDATION_FAILURE':
        return this.currentState === 'VALIDATING' ? 'FAILED' : null;

      case 'START_EXECUTION':
        return this.currentState === 'VALIDATING' ? 'EXECUTING' : null;

      case 'EXECUTION_SUCCESS':
        return this.currentState === 'EXECUTING' ? 'COMPLETED' : null;

      case 'EXECUTION_FAILURE':
        return this.currentState === 'EXECUTING' ? 'FAILED' : null;

      case 'ROLLBACK':
        return this.currentState === 'FAILED' ? 'ROLLED_BACK' : null;

      default:
        return null;
    }
  }

  /**
   * Get current state
   */
  getState(): ExecutionState {
    return this.currentState;
  }

  /**
   * Get all transitions
   */
  getTransitions(): StateTransition[] {
    return [...this.transitions];
  }

  /**
   * Check if state is terminal
   */
  isTerminal(): boolean {
    return ['COMPLETED', 'ROLLED_BACK'].includes(this.currentState);
  }

  /**
   * Check if execution failed
   */
  isFailed(): boolean {
    return this.currentState === 'FAILED';
  }

  /**
   * Check if execution succeeded
   */
  isSuccessful(): boolean {
    return this.currentState === 'COMPLETED';
  }

  /**
   * Reset state machine
   */
  reset(): void {
    this.currentState = this.config.initialState;
    this.transitions = [];
  }

  /**
   * Export state for persistence
   */
  export(): {
    currentState: ExecutionState;
    transitions: StateTransition[];
  } {
    return {
      currentState: this.currentState,
      transitions: this.transitions
    };
  }

  /**
   * Import state from persistence
   */
  static import(data: {
    currentState: ExecutionState;
    transitions: StateTransition[];
  }): ExecutionStateMachine {
    const machine = new ExecutionStateMachine({ initialState: data.currentState });
    machine.transitions = data.transitions;
    return machine;
  }
}

/**
 * Validation Rules for Financial Operations
 */
export class FinancialValidator {

  /**
   * Validate fund transfer
   */
  static async validateTransfer(params: {
    amount: number;
    sourceBalance: number;
    liquidityBuffer: number;
  }): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check sufficient balance
    if (params.amount > params.sourceBalance) {
      errors.push('Insufficient balance for transfer');
    }

    // Check liquidity buffer
    if ((params.sourceBalance - params.amount) < params.liquidityBuffer) {
      errors.push(`Transfer would breach liquidity buffer of $${params.liquidityBuffer}`);
    }

    // Check minimum transfer
    if (params.amount < 1) {
      errors.push('Transfer amount must be at least $1');
    }

    // Check maximum transfer (anti-fraud)
    if (params.amount > 10000) {
      errors.push('Transfer amount exceeds daily limit of $10,000');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate subscription cancellation
   */
  static async validateCancellation(params: {
    subscriptionId: string;
    lastChargeDate: Date;
    daysUnused: number;
  }): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check subscription exists
    if (!params.subscriptionId) {
      errors.push('Subscription ID is required');
    }

    // Check if truly unused
    if (params.daysUnused < 30) {
      errors.push('Subscription must be unused for at least 30 days');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate investment creation
   */
  static async validateInvestment(params: {
    amount: number;
    riskProfile: 'CONSERVATIVE' | 'AGGRESSIVE';
    investmentType: string;
    liquidityDays: number;
  }): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Check minimum investment
    if (params.amount < 100) {
      errors.push('Minimum investment amount is $100');
    }

    // Check risk profile match
    if (params.riskProfile === 'CONSERVATIVE' && params.liquidityDays > 30) {
      errors.push('Conservative profile requires liquid investments (≤30 days)');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

/**
 * Rollback Handler for Failed Executions
 */
export class RollbackHandler {

  /**
   * Rollback fund transfer
   */
  static async rollbackTransfer(transferId: string): Promise<boolean> {
    try {
      console.log(`Rolling back transfer: ${transferId}`);
      // In production, call Plaid API to reverse transfer
      return true;
    } catch (error) {
      console.error('Rollback failed:', error);
      return false;
    }
  }

  /**
   * Rollback subscription cancellation
   */
  static async rollbackCancellation(subscriptionId: string): Promise<boolean> {
    try {
      console.log(`Rolling back cancellation: ${subscriptionId}`);
      // In production, send re-activation email or API call
      return true;
    } catch (error) {
      console.error('Rollback failed:', error);
      return false;
    }
  }

  /**
   * Rollback investment creation
   */
  static async rollbackInvestment(investmentId: string): Promise<boolean> {
    try {
      console.log(`Rolling back investment: ${investmentId}`);
      // In production, liquidate position and return funds
      return true;
    } catch (error) {
      console.error('Rollback failed:', error);
      return false;
    }
  }
}
