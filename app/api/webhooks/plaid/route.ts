// Plaid Webhook Handler
// Processes real-time transaction updates from Plaid

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

// Verify webhook signature for security
function verifyWebhookSignature(body: string, signature: string): boolean {
  if (!process.env.WEBHOOK_VERIFICATION_TOKEN) return false;

  const hmac = crypto.createHmac('sha256', process.env.WEBHOOK_VERIFICATION_TOKEN);
  const digest = hmac.update(body).digest('hex');

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('plaid-verification') || '';

    // Verify webhook authenticity
    if (!verifyWebhookSignature(body, signature)) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      );
    }

    const payload = JSON.parse(body);
    const { webhook_type, webhook_code, item_id } = payload;

    // Handle different webhook types
    switch (webhook_type) {
      case 'TRANSACTIONS':
        await handleTransactionWebhook(payload);
        break;

      case 'ITEM':
        await handleItemWebhook(payload);
        break;

      default:
        console.log(`Unhandled webhook type: ${webhook_type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleTransactionWebhook(payload: any) {
  const { item_id, new_transactions, removed_transactions } = payload;

  // TODO: Fetch user by item_id
  // const user = await prisma.user.findFirst({ where: { plaidItemId: item_id } });

  // Process new transactions
  if (new_transactions > 0) {
    console.log(`Processing ${new_transactions} new transactions for item ${item_id}`);
    // Fetch transactions from Plaid API and store in database
    // This will trigger the Transaction Sanitizer in Data Cruncher Agent
  }

  // Handle removed transactions
  if (removed_transactions && removed_transactions.length > 0) {
    console.log(`Removing ${removed_transactions.length} transactions`);
    // Remove from database
  }
}

async function handleItemWebhook(payload: any) {
  const { webhook_code, error, item_id } = payload;

  // Handle item errors (e.g., login required)
  if (webhook_code === 'ERROR') {
    console.error(`Item error for ${item_id}:`, error);
    // Notify user to re-authenticate
  }
}
