// Financial Goals API
// Create, read, update, delete user financial goals

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET - Fetch user goals
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const goals = await prisma.financialGoal.findMany({
      where: { userId },
      orderBy: [{ priority: 'asc' }, { targetDate: 'asc' }]
    });

    return NextResponse.json({ goals });
  } catch (error) {
    console.error('Goals fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 });
  }
}

// POST - Create new goal
export async function POST(request: NextRequest) {
  try {
    const { userId, name, description, targetAmount, targetDate, priority } = await request.json();

    if (!userId || !name || !targetAmount || !targetDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const goal = await prisma.financialGoal.create({
      data: {
        userId,
        name,
        description,
        targetAmount,
        targetDate: new Date(targetDate),
        priority: priority || 1,
        status: 'ACTIVE'
      }
    });

    return NextResponse.json({ goal });
  } catch (error) {
    console.error('Goal creation error:', error);
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
  }
}

// PATCH - Update goal progress
export async function PATCH(request: NextRequest) {
  try {
    const { goalId, currentAmount, status } = await request.json();

    if (!goalId) {
      return NextResponse.json({ error: 'Goal ID required' }, { status: 400 });
    }

    const updateData: any = {};
    if (currentAmount !== undefined) updateData.currentAmount = currentAmount;
    if (status) updateData.status = status;

    const goal = await prisma.financialGoal.update({
      where: { id: goalId },
      data: updateData
    });

    return NextResponse.json({ goal });
  } catch (error) {
    console.error('Goal update error:', error);
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
  }
}

// DELETE - Remove goal
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const goalId = searchParams.get('goalId');

    if (!goalId) {
      return NextResponse.json({ error: 'Goal ID required' }, { status: 400 });
    }

    await prisma.financialGoal.delete({
      where: { id: goalId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Goal deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 });
  }
}
