// Plaid Client - Secure Banking API Integration
// State management and handshake protocol for production

import crypto from 'crypto';

// Plaid API Configuration
const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';
const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID;
const PLAID_SECRET = process.env.PLAID_SECRET;

// Base URLs by environment
const PLAID_BASE_URLS = {
  sandbox: 'https://sandbox.plaid.com',
  development: 'https://development.plaid.com',
  production: 'https://production.plaid.com'
};

const BASE_URL = PLAID_BASE_URLS[PLAID_ENV as keyof typeof PLAID_BASE_URLS];

// State Management for Plaid Sessions
interface PlaidSessionState {
  sessionId: string;
  userId: string;
  accessToken?: string;
  itemId?: string;
  institutionId?: string;
  state: 'initiated' | 'connected' | 'syncing' | 'active' | 'error';
  createdAt: Date;
  lastSyncedAt?: Date;
  error?: string;
}

// In-memory state store (replace with Redis in production)
const sessionStore = new Map<string, PlaidSessionState>();

/**
 * Generate secure handshake token for Plaid Link
 */
export function generateLinkToken(userId: string): string {
  const sessionId = crypto.randomBytes(32).toString('hex');
  const timestamp = Date.now();
  const payload = `${userId}:${sessionId}:${timestamp}`;

  const hmac = crypto.createHmac('sha256', process.env.HMAC_SECRET_KEY || 'default_secret');
  const signature = hmac.update(payload).digest('hex');

  return `plaid_link_${signature.substring(0, 16)}`;
}

/**
 * Initialize Plaid session with state tracking
 */
export async function initializePlaidSession(userId: string): Promise<PlaidSessionState> {
  const sessionId = crypto.randomUUID();

  const session: PlaidSessionState = {
    sessionId,
    userId,
    state: 'initiated',
    createdAt: new Date()
  };

  sessionStore.set(sessionId, session);
  return session;
}

/**
 * Exchange public token for access token (OAuth handshake)
 */
export async function exchangePublicToken(
  publicToken: string,
  userId: string
): Promise<{ accessToken: string; itemId: string }> {

  try {
    // In production, call actual Plaid API
    // const response = await fetch(`${BASE_URL}/item/public_token/exchange`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'PLAID-CLIENT-ID': PLAID_CLIENT_ID!,
    //     'PLAID-SECRET': PLAID_SECRET!,
    //   },
    //   body: JSON.stringify({ public_token: publicToken })
    // });
    // const data = await response.json();

    // Mock response for development
    const accessToken = `access-${PLAID_ENV}-${crypto.randomBytes(16).toString('hex')}`;
    const itemId = `item-${crypto.randomBytes(8).toString('hex')}`;

    // Update session state
    const sessions = Array.from(sessionStore.values());
    const session = sessions.find(s => s.userId === userId && s.state === 'initiated');

    if (session) {
      session.accessToken = accessToken;
      session.itemId = itemId;
      session.state = 'connected';
      sessionStore.set(session.sessionId, session);
    }

    return { accessToken, itemId };

  } catch (error) {
    console.error('Token exchange failed:', error);
    throw new Error('Failed to exchange public token');
  }
}

/**
 * Fetch transactions with state management
 */
export async function fetchTransactions(
  accessToken: string,
  startDate: string,
  endDate: string
): Promise<any[]> {

  try {
    // Update session state to syncing
    const sessions = Array.from(sessionStore.values());
    const session = sessions.find(s => s.accessToken === accessToken);

    if (session) {
      session.state = 'syncing';
      sessionStore.set(session.sessionId, session);
    }

    // In production, call actual Plaid API
    // const response = await fetch(`${BASE_URL}/transactions/get`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'PLAID-CLIENT-ID': PLAID_CLIENT_ID!,
    //     'PLAID-SECRET': PLAID_SECRET!,
    //   },
    //   body: JSON.stringify({
    //     access_token: accessToken,
    //     start_date: startDate,
    //     end_date: endDate,
    //     options: { count: 500 }
    //   })
    // });
    // const data = await response.json();

    // Mock transactions for development
    const mockTransactions = generateMockTransactions();

    // Update session state to active
    if (session) {
      session.state = 'active';
      session.lastSyncedAt = new Date();
      sessionStore.set(session.sessionId, session);
    }

    return mockTransactions;

  } catch (error) {
    console.error('Transaction fetch failed:', error);

    // Update session state to error
    const sessions = Array.from(sessionStore.values());
    const session = sessions.find(s => s.accessToken === accessToken);

    if (session) {
      session.state = 'error';
      session.error = error instanceof Error ? error.message : 'Unknown error';
      sessionStore.set(session.sessionId, session);
    }

    throw new Error('Failed to fetch transactions');
  }
}

/**
 * Initiate fund transfer (Plaid Transfer API)
 */
export async function initiateTransfer(
  accessToken: string,
  accountId: string,
  amount: number,
  description: string
): Promise<{ transferId: string; status: string }> {

  try {
    // In production, call actual Plaid Transfer API
    // const response = await fetch(`${BASE_URL}/transfer/create`, { ... });

    // Mock response
    const transferId = `transfer-${crypto.randomBytes(12).toString('hex')}`;

    return {
      transferId,
      status: 'pending'
    };

  } catch (error) {
    console.error('Transfer initiation failed:', error);
    throw new Error('Failed to initiate transfer');
  }
}

/**
 * Get account balances
 */
export async function getAccountBalances(accessToken: string): Promise<any> {

  try {
    // In production, call actual Plaid API
    // const response = await fetch(`${BASE_URL}/accounts/balance/get`, { ... });

    // Mock balance data
    return {
      accounts: [
        {
          account_id: 'acc_checking_001',
          name: 'Chase Total Checking',
          type: 'depository',
          subtype: 'checking',
          balances: {
            available: 3467.82,
            current: 3467.82,
            limit: null,
            iso_currency_code: 'USD'
          }
        },
        {
          account_id: 'acc_savings_001',
          name: 'Chase Savings',
          type: 'depository',
          subtype: 'savings',
          balances: {
            available: 12540.15,
            current: 12540.15,
            limit: null,
            iso_currency_code: 'USD'
          }
        }
      ]
    };

  } catch (error) {
    console.error('Balance fetch failed:', error);
    throw new Error('Failed to fetch account balances');
  }
}

/**
 * Get session state
 */
export function getSessionState(sessionId: string): PlaidSessionState | undefined {
  return sessionStore.get(sessionId);
}

/**
 * Get all sessions for user
 */
export function getUserSessions(userId: string): PlaidSessionState[] {
  return Array.from(sessionStore.values()).filter(s => s.userId === userId);
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const hmac = crypto.createHmac('sha256', process.env.WEBHOOK_VERIFICATION_TOKEN || '');
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

// Helper: Generate mock transactions for development
function generateMockTransactions() {
  const today = new Date();

  return [
    {
      transaction_id: 'txn_001',
      account_id: 'acc_checking_001',
      amount: 2000.00,
      date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      name: 'RENT PAYMENT',
      merchant_name: 'Property Management Co',
      category: ['Payment', 'Rent'],
      pending: false
    },
    {
      transaction_id: 'txn_002',
      account_id: 'acc_checking_001',
      amount: 450.23,
      date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      name: 'WHOLE FOODS',
      merchant_name: 'Whole Foods Market',
      category: ['Shops', 'Food and Drink', 'Groceries'],
      pending: false
    },
    {
      transaction_id: 'txn_003',
      account_id: 'acc_checking_001',
      amount: 15.99,
      date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      name: 'NETFLIX',
      merchant_name: 'Netflix',
      category: ['Service', 'Subscription'],
      pending: false
    },
    {
      transaction_id: 'txn_003_dup',
      account_id: 'acc_checking_001',
      amount: 15.99,
      date: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      name: 'NETFLIX',
      merchant_name: 'Netflix',
      category: ['Service', 'Subscription'],
      pending: false
    },
    {
      transaction_id: 'txn_004',
      account_id: 'acc_checking_001',
      amount: 9.99,
      date: new Date(today.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      name: 'SPOTIFY',
      merchant_name: 'Spotify',
      category: ['Service', 'Subscription'],
      pending: false
    },
    {
      transaction_id: 'txn_005',
      account_id: 'acc_checking_001',
      amount: -6000.00,
      date: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      name: 'SALARY DEPOSIT',
      merchant_name: 'ACME CORP PAYROLL',
      category: ['Transfer', 'Payroll'],
      pending: false
    },
    {
      transaction_id: 'txn_006',
      account_id: 'acc_checking_001',
      amount: 80.45,
      date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      name: 'SHELL GAS',
      merchant_name: 'Shell',
      category: ['Transportation', 'Gas'],
      pending: false
    }
  ];
}
