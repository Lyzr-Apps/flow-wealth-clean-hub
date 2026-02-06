// Agent Orchestration API - Production Wealth Analysis
// Triggers the Autonomous Wealth Controller (Manager Agent)

import { NextRequest, NextResponse } from 'next/server';
import { callAIAgent } from '@/lib/aiAgent';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

const MANAGER_AGENT_ID = process.env.WEALTH_ARCHITECT_MANAGER_ID || '698586be382ef8715224cf22';

export async function POST(request: NextRequest) {
  try {
    const { userId, userInput } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Fetch user context from database
    const userContext = await buildUserContext(userId);

    // Build enriched prompt for the Autonomous Wealth Controller
    const enrichedPrompt = `
User Financial Analysis Request:
${userInput || 'Analyze my current financial state and provide recommendations.'}

USER CONTEXT:
${JSON.stringify(userContext, null, 2)}

INSTRUCTIONS:
1. Coordinate with Data Cruncher to analyze transactions and calculate shadow balance
2. Coordinate with Market Strategist to find goal-aligned investment opportunities
3. Coordinate with Executioner to prepare execution bundles
4. Return recommendations prioritized by user goals
5. Include UI interaction tags for frontend rendering
6. Calculate Financial Health Score (0-100)

Please provide a comprehensive wealth optimization analysis.
    `.trim();

    // Call the Autonomous Wealth Controller
    const response = await callAIAgent(MANAGER_AGENT_ID, enrichedPrompt);

    // Parse agent response
    let analysisResult;
    try {
      analysisResult = typeof response === 'string' ? JSON.parse(response) : response;
    } catch {
      analysisResult = response;
    }

    // Save snapshot to database
    await saveFinancialSnapshot(userId, analysisResult);

    // Process UI interaction tags
    const uiMetadata = extractUIMetadata(analysisResult);

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      uiMetadata,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Agent analysis error:', error);
    return NextResponse.json(
      {
        error: 'Analysis failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Build comprehensive user context for agent
async function buildUserContext(userId: string) {
  const [user, goals, recentTransactions, preferences, triggers] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.financialGoal.findMany({
      where: { userId, status: 'ACTIVE' },
      orderBy: { priority: 'asc' }
    }),
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 100
    }),
    prisma.userPreferences.findUnique({ where: { userId } }),
    prisma.intentTrigger.findMany({
      where: { userId, isActive: true }
    })
  ]);

  return {
    riskProfile: user?.riskProfile || 'CONSERVATIVE',
    goals: goals.map(g => ({
      name: g.name,
      targetAmount: g.targetAmount.toString(),
      currentAmount: g.currentAmount.toString(),
      targetDate: g.targetDate,
      priority: g.priority
    })),
    recentTransactions: recentTransactions.slice(0, 50).map(t => ({
      date: t.date,
      merchant: t.merchantName,
      amount: t.amount.toString(),
      category: t.categorySanitized,
      isDuplicate: t.isDuplicate,
      isVampire: t.isVampire
    })),
    preferences: {
      idleMoneyThreshold: preferences?.idleMoneyThreshold || 15,
      autoExecuteEnabled: preferences?.autoExecuteEnabled || false,
      shadowBalanceDays: preferences?.shadowBalanceDays || 14,
      liquidityBuffer: preferences?.liquidityBufferAmount.toString() || '500'
    },
    activeIntentTriggers: triggers.map(t => ({
      name: t.name,
      naturalLanguage: t.naturalLanguage,
      triggerCount: t.triggerCount
    }))
  };
}

// Save financial health snapshot
async function saveFinancialSnapshot(userId: string, analysis: any) {
  try {
    const healthScore = analysis.financial_health_score || 75;
    const shadowBalance = analysis.shadow_balance || 0;
    const idleCapital = analysis.wealth_optimization_summary?.idle_capital || 0;

    // Determine UI theme based on analysis
    let uiTheme: 'URGENT' | 'GROWTH' | 'STABLE' = 'STABLE';
    if (analysis.ui_interaction_tags?.includes('UI_THEME: URGENT')) {
      uiTheme = 'URGENT';
    } else if (analysis.ui_interaction_tags?.includes('UI_THEME: GROWTH')) {
      uiTheme = 'GROWTH';
    }

    await prisma.financialHealthSnapshot.create({
      data: {
        userId,
        healthScore,
        savingsRate: 0, // Calculate from transactions
        protectionScore: 50, // Placeholder
        optimizationScore: healthScore,
        bankBalance: 0, // From Plaid
        shadowBalance: parseFloat(shadowBalance),
        idleCapital: parseFloat(idleCapital),
        workingCapital: 0,
        monthlyBurnRate: 0,
        predictedBurnRate: 0,
        uiTheme
      }
    });
  } catch (error) {
    console.error('Failed to save snapshot:', error);
  }
}

// Extract UI interaction metadata from agent response
function extractUIMetadata(analysis: any) {
  const metadata = {
    theme: 'STABLE',
    actions: [] as string[],
    alerts: [] as string[]
  };

  // Parse UI interaction tags
  const tags = analysis.ui_interaction_tags || [];

  tags.forEach((tag: string) => {
    if (tag.includes('UI_THEME: URGENT')) metadata.theme = 'URGENT';
    if (tag.includes('UI_THEME: GROWTH')) metadata.theme = 'GROWTH';
    if (tag.includes('ACTION: EXECUTE_SWEEP')) metadata.actions.push('EXECUTE_SWEEP');
    if (tag.includes('ACTION: CANCEL_SUBSCRIPTION')) metadata.actions.push('CANCEL_SUBSCRIPTION');
  });

  return metadata;
}
