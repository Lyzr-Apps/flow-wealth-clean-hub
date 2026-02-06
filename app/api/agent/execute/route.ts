// Agent Execution API - Secure Action Handler
// Triggers the Executioner Agent with state management and audit trails

import { NextRequest, NextResponse } from 'next/server';
import { callAIAgent } from '@/lib/aiAgent';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

const EXECUTIONER_AGENT_ID = process.env.EXECUTIONER_AGENT_ID || '698586981caa4e686dd66dba';

// Generate HMAC signature for security
function generateHMAC(payload: string): string {
  const secret = process.env.HMAC_SECRET_KEY || 'default_secret_change_in_prod';
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

// Generate idempotency key
function generateIdempotencyKey(): string {
  return `exec_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`;
}

export async function POST(request: NextRequest) {
  try {
    const { userId, actionType, actionData, bundleId } = await request.json();

    if (!userId || !actionType) {
      return NextResponse.json(
        { error: 'User ID and action type are required' },
        { status: 400 }
      );
    }

    // Generate security metadata
    const idempotencyKey = generateIdempotencyKey();
    const requestPayload = JSON.stringify({ userId, actionType, actionData });
    const hmacSignature = generateHMAC(requestPayload);

    // Create execution history record (audit trail)
    const execution = await prisma.executionHistory.create({
      data: {
        userId,
        executionType: mapActionTypeToExecutionType(actionType),
        bundleId,
        agentId: EXECUTIONER_AGENT_ID,
        requestPayload: { userId, actionType, actionData },
        responsePayload: {},
        state: 'PENDING',
        hmacSignature,
        idempotencyKey,
        regulatoryFlags: ['GDPR', 'PSD2']
      }
    });

    // Build prompt for Executioner Agent
    const executionPrompt = `
Execute the following financial action with security protocol:

ACTION TYPE: ${actionType}
USER ID: ${userId}
BUNDLE ID: ${bundleId || 'N/A'}
IDEMPOTENCY KEY: ${idempotencyKey}

ACTION DETAILS:
${JSON.stringify(actionData, null, 2)}

SECURITY REQUIREMENTS:
1. Validate sufficient balance and liquidity
2. Generate API call bundle with rollback plan
3. Include HMAC signature: ${hmacSignature}
4. Return execution state transitions
5. Provide audit trail data for compliance

REGULATORY COMPLIANCE:
- GDPR: Ensure data minimization and consent
- PSD2: Strong customer authentication required

Please prepare and validate the execution bundle.
    `.trim();

    // Update state to VALIDATING
    await updateExecutionState(execution.id, 'VALIDATING');

    // Call Executioner Agent
    const response = await callAIAgent(EXECUTIONER_AGENT_ID, executionPrompt);

    // Parse agent response
    let executionResult;
    try {
      executionResult = typeof response === 'string' ? JSON.parse(response) : response;
    } catch {
      executionResult = { rawResponse: response };
    }

    // Update execution history with response
    await prisma.executionHistory.update({
      where: { id: execution.id },
      data: {
        responsePayload: executionResult,
        state: 'EXECUTING'
      }
    });

    // Simulate execution (in production, this would call actual APIs)
    const executionSuccess = await simulateExecution(actionType, actionData);

    // Update final state
    await prisma.executionHistory.update({
      where: { id: execution.id },
      data: {
        state: executionSuccess ? 'COMPLETED' : 'FAILED',
        success: executionSuccess,
        completedAt: new Date()
      }
    });

    return NextResponse.json({
      success: executionSuccess,
      executionId: execution.id,
      idempotencyKey,
      result: executionResult,
      state: executionSuccess ? 'COMPLETED' : 'FAILED'
    });

  } catch (error) {
    console.error('Execution error:', error);
    return NextResponse.json(
      {
        error: 'Execution failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Update execution state with transition tracking
async function updateExecutionState(
  executionId: string,
  newState: 'PENDING' | 'VALIDATING' | 'EXECUTING' | 'COMPLETED' | 'FAILED' | 'ROLLED_BACK'
) {
  const execution = await prisma.executionHistory.findUnique({
    where: { id: executionId }
  });

  const stateTransitions = (execution?.stateTransitions as any[]) || [];
  stateTransitions.push({
    from: execution?.state,
    to: newState,
    timestamp: new Date().toISOString()
  });

  await prisma.executionHistory.update({
    where: { id: executionId },
    data: {
      state: newState,
      stateTransitions
    }
  });
}

// Map frontend action type to database execution type
function mapActionTypeToExecutionType(actionType: string): 'FUND_SWEEP' | 'SUBSCRIPTION_CANCEL' | 'REFUND_REQUEST' | 'GOAL_TRANSFER' | 'INVESTMENT_CREATE' | 'INTENT_TRIGGER' {
  const mapping: Record<string, any> = {
    'sweep': 'FUND_SWEEP',
    'cancel_subscription': 'SUBSCRIPTION_CANCEL',
    'request_refund': 'REFUND_REQUEST',
    'transfer_to_goal': 'GOAL_TRANSFER',
    'create_investment': 'INVESTMENT_CREATE',
    'trigger': 'INTENT_TRIGGER'
  };

  return mapping[actionType] || 'FUND_SWEEP';
}

// Simulate execution (replace with actual API calls in production)
async function simulateExecution(actionType: string, actionData: any): Promise<boolean> {
  // In production, this would:
  // 1. Call Plaid API for fund transfers
  // 2. Send Gmail via Composio for cancellations
  // 3. Process refund requests
  // 4. Create investment accounts

  console.log(`Simulating execution: ${actionType}`, actionData);

  // Simulate 90% success rate
  return Math.random() > 0.1;
}
