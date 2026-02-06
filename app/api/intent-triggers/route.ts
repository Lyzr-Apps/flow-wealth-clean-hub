// Intent-Based Triggers API
// Natural language automation rules (e.g., "Save $50 when I spend <$10 on lunch")

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Fetch user intent triggers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const triggers = await prisma.intentTrigger.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ triggers });
  } catch (error) {
    console.error('Triggers fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch triggers' }, { status: 500 });
  }
}

// POST - Create new intent trigger
export async function POST(request: NextRequest) {
  try {
    const {
      userId,
      name,
      naturalLanguage,
      triggerType,
      conditionCategory,
      conditionOperator,
      conditionAmount,
      actionType,
      actionAmount,
      targetGoalId
    } = await request.json();

    if (!userId || !name || !naturalLanguage || !triggerType || !actionType || !actionAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const trigger = await prisma.intentTrigger.create({
      data: {
        userId,
        name,
        naturalLanguage,
        triggerType,
        conditionCategory,
        conditionOperator,
        conditionAmount,
        actionType,
        actionAmount,
        targetGoalId,
        isActive: true
      }
    });

    return NextResponse.json({ trigger });
  } catch (error) {
    console.error('Trigger creation error:', error);
    return NextResponse.json({ error: 'Failed to create trigger' }, { status: 500 });
  }
}

// PATCH - Toggle trigger active status
export async function PATCH(request: NextRequest) {
  try {
    const { triggerId, isActive } = await request.json();

    if (!triggerId) {
      return NextResponse.json({ error: 'Trigger ID required' }, { status: 400 });
    }

    const trigger = await prisma.intentTrigger.update({
      where: { id: triggerId },
      data: { isActive }
    });

    return NextResponse.json({ trigger });
  } catch (error) {
    console.error('Trigger update error:', error);
    return NextResponse.json({ error: 'Failed to update trigger' }, { status: 500 });
  }
}

// DELETE - Remove intent trigger
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const triggerId = searchParams.get('triggerId');

    if (!triggerId) {
      return NextResponse.json({ error: 'Trigger ID required' }, { status: 400 });
    }

    await prisma.intentTrigger.delete({
      where: { id: triggerId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Trigger deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete trigger' }, { status: 500 });
  }
}
