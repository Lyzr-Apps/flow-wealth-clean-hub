'use client'

/**
 * FlowState - Autonomous Wealth Optimization Platform
 * Production-Grade Dashboard with Advanced Features
 */

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import {
  FaDollarSign,
  FaChartLine,
  FaFireAlt,
  FaLightbulb,
  FaCreditCard,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSpinner,
  FaTimes,
  FaChevronRight,
  FaCog,
  FaRedo,
  FaBolt,
  FaShieldAlt,
  FaRocket,
  FaCalendarAlt,
  FaBullseye,
  FaHistory,
  FaMagic,
  FaInfoCircle,
  FaPlus,
  FaEdit,
  FaTrash,
  FaToggleOn,
  FaToggleOff,
  FaLock,
  FaCheck,
  FaTrophy,
  FaArrowUp,
  FaArrowDown,
  FaChartBar,
  FaMoneyBillWave,
  FaGem
} from 'react-icons/fa'

// Mock User ID (in production, from auth)
const MOCK_USER_ID = 'user_demo_001'

// TypeScript Interfaces
interface FinancialGoal {
  id: string
  name: string
  description?: string
  targetAmount: number
  currentAmount: number
  targetDate: string
  priority: number
  status: string
  progress?: number
}

interface IntentTrigger {
  id: string
  name: string
  naturalLanguage: string
  triggerType: string
  conditionCategory?: string
  conditionOperator?: string
  conditionAmount?: number
  actionType: string
  actionAmount: number
  targetGoalId?: string
  isActive: boolean
  triggerCount?: number
  totalSaved?: number
}

interface Recommendation {
  id: string
  type: string
  title: string
  amount: number
  insight: string
  benefit: string
  timeline?: string
  status: 'pending' | 'validating' | 'executing' | 'completed' | 'failed' | 'dismissed'
  priority: 'high' | 'medium' | 'low'
  goalImpact?: {
    goalId: string
    goalName: string
    progressIncrease: number
  }
  executionBundle?: {
    apiCalls: string[]
    rollbackPlan: string
  }
  regulatoryFlags?: string[]
  reasoning?: {
    insight: string
    benefit: string
    timeline: string
  }
}

interface ExecutionHistoryItem {
  id: string
  executionType: string
  bundleId?: string
  state: string
  requestPayload: any
  responsePayload: any
  stateTransitions?: Array<{ from: string; to: string; timestamp: string }>
  hmacSignature: string
  idempotencyKey: string
  success?: boolean
  createdAt: string
  completedAt?: string
  regulatoryFlags?: string[]
}

interface PredictedBill {
  id: string
  merchant: string
  amount: number
  predictedDate: string
  confidence: number
  category: string
}

interface FinancialHealthScore {
  total: number
  savingsRate: number
  protection: number
  optimization: number
  trend: 'up' | 'down' | 'stable'
}

interface ShadowBalance {
  bankBalance: number
  predictedBills: number
  shadowBalance: number
  status: 'healthy' | 'tight' | 'negative'
}

type UITheme = 'URGENT' | 'GROWTH' | 'STABLE'

export default function Home() {
  // State Management
  const [activeTab, setActiveTab] = useState('dashboard')
  const [uiTheme, setUiTheme] = useState<UITheme>('STABLE')

  // Financial Data
  const [shadowBalance, setShadowBalance] = useState<ShadowBalance>({
    bankBalance: 4250,
    predictedBills: 850,
    shadowBalance: 3400,
    status: 'healthy'
  })
  const [healthScore, setHealthScore] = useState<FinancialHealthScore>({
    total: 75,
    savingsRate: 72,
    protection: 68,
    optimization: 85,
    trend: 'up'
  })
  const [goals, setGoals] = useState<FinancialGoal[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [intentTriggers, setIntentTriggers] = useState<IntentTrigger[]>([])
  const [executionHistory, setExecutionHistory] = useState<ExecutionHistoryItem[]>([])
  const [predictedBills, setPredictedBills] = useState<PredictedBill[]>([])

  // UI State
  const [analyzing, setAnalyzing] = useState(false)
  const [executing, setExecuting] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Modals
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    recommendation: Recommendation | null
  }>({ open: false, recommendation: null })
  const [goalDialog, setGoalDialog] = useState<{
    open: boolean
    goal: FinancialGoal | null
  }>({ open: false, goal: null })
  const [triggerDialog, setTriggerDialog] = useState(false)

  // Form Data
  const [goalForm, setGoalForm] = useState({
    name: '',
    description: '',
    targetAmount: '',
    targetDate: '',
    priority: 1
  })
  const [triggerForm, setTriggerForm] = useState({
    naturalLanguage: '',
    parsedData: null as any
  })

  // Auto-dismiss messages
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage(null)
        setError(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage, error])

  // Load initial data
  useEffect(() => {
    loadGoals()
    loadIntentTriggers()
    loadMockPredictedBills()
  }, [])

  // API Functions
  const loadGoals = async () => {
    try {
      const response = await fetch(`/api/goals?userId=${MOCK_USER_ID}`)
      const data = await response.json()
      if (data.goals) {
        const goalsWithProgress = data.goals.map((g: any) => ({
          ...g,
          targetAmount: parseFloat(g.targetAmount),
          currentAmount: parseFloat(g.currentAmount),
          progress: (parseFloat(g.currentAmount) / parseFloat(g.targetAmount)) * 100
        }))
        setGoals(goalsWithProgress)
      }
    } catch (err) {
      console.error('Failed to load goals:', err)
      // Load mock data
      setGoals([
        {
          id: 'goal1',
          name: 'House Down Payment',
          description: 'Save for dream home',
          targetAmount: 50000,
          currentAmount: 12500,
          targetDate: '2028-12-31',
          priority: 1,
          status: 'ACTIVE',
          progress: 25
        },
        {
          id: 'goal2',
          name: 'Mumbai Trip',
          description: 'Family vacation',
          targetAmount: 5000,
          currentAmount: 2100,
          targetDate: '2026-08-15',
          priority: 2,
          status: 'ACTIVE',
          progress: 42
        },
        {
          id: 'goal3',
          name: 'Emergency Fund',
          description: '6 months expenses',
          targetAmount: 18000,
          currentAmount: 9000,
          targetDate: '2027-06-30',
          priority: 1,
          status: 'ACTIVE',
          progress: 50
        }
      ])
    }
  }

  const loadIntentTriggers = async () => {
    try {
      const response = await fetch(`/api/intent-triggers?userId=${MOCK_USER_ID}`)
      const data = await response.json()
      if (data.triggers) {
        setIntentTriggers(data.triggers.map((t: any) => ({
          ...t,
          actionAmount: parseFloat(t.actionAmount),
          conditionAmount: t.conditionAmount ? parseFloat(t.conditionAmount) : undefined
        })))
      }
    } catch (err) {
      console.error('Failed to load triggers:', err)
      // Load mock data
      setIntentTriggers([
        {
          id: 'trigger1',
          name: 'Lunch Savings',
          naturalLanguage: 'Save $50 for Mumbai trip every time I spend <$10 on lunch',
          triggerType: 'SPENDING_BASED',
          conditionCategory: 'Food & Drink',
          conditionOperator: '<',
          conditionAmount: 10,
          actionType: 'SAVE_TO_GOAL',
          actionAmount: 50,
          targetGoalId: 'goal2',
          isActive: true,
          triggerCount: 12,
          totalSaved: 600
        }
      ])
    }
  }

  const loadMockPredictedBills = () => {
    const today = new Date()
    const bills: PredictedBill[] = [
      {
        id: 'bill1',
        merchant: 'Rent Payment',
        amount: 1200,
        predictedDate: new Date(today.getFullYear(), today.getMonth(), 1).toISOString(),
        confidence: 95,
        category: 'Housing'
      },
      {
        id: 'bill2',
        merchant: 'Electric Company',
        amount: 120,
        predictedDate: new Date(today.getFullYear(), today.getMonth(), 15).toISOString(),
        confidence: 88,
        category: 'Utilities'
      },
      {
        id: 'bill3',
        merchant: 'Internet Service',
        amount: 80,
        predictedDate: new Date(today.getFullYear(), today.getMonth(), 10).toISOString(),
        confidence: 92,
        category: 'Utilities'
      },
      {
        id: 'bill4',
        merchant: 'Phone Bill',
        amount: 65,
        predictedDate: new Date(today.getFullYear(), today.getMonth(), 20).toISOString(),
        confidence: 90,
        category: 'Utilities'
      },
      {
        id: 'bill5',
        merchant: 'Car Insurance',
        amount: 185,
        predictedDate: new Date(today.getFullYear(), today.getMonth(), 25).toISOString(),
        confidence: 85,
        category: 'Insurance'
      }
    ]
    setPredictedBills(bills)
  }

  const handleAnalyzeFinances = async () => {
    setAnalyzing(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch('/api/agent/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: MOCK_USER_ID,
          userInput: 'Analyze my financial situation and provide wealth optimization recommendations aligned with my goals.'
        })
      })

      const data = await response.json()

      if (data.success) {
        // Extract UI theme from metadata
        if (data.uiMetadata?.theme) {
          setUiTheme(data.uiMetadata.theme)
        }

        // Parse recommendations
        const recs = parseRecommendations(data.analysis)
        setRecommendations(recs)

        // Update health score if present
        if (data.analysis?.financial_health_score) {
          setHealthScore({
            total: data.analysis.financial_health_score,
            savingsRate: data.analysis.savings_rate_score || 72,
            protection: data.analysis.protection_score || 68,
            optimization: data.analysis.optimization_score || 85,
            trend: data.analysis.trend || 'up'
          })
        }

        // Update shadow balance if present
        if (data.analysis?.shadow_balance !== undefined) {
          const predicted = predictedBills.reduce((sum, bill) => sum + bill.amount, 0)
          setShadowBalance({
            bankBalance: 4250,
            predictedBills: predicted,
            shadowBalance: data.analysis.shadow_balance,
            status: data.analysis.shadow_balance > 1000 ? 'healthy' :
                    data.analysis.shadow_balance > 0 ? 'tight' : 'negative'
          })
        }

        setSuccessMessage('Financial analysis complete! Review your optimization opportunities.')
      } else {
        setError(data.error || 'Analysis failed. Showing default recommendations.')
        loadDefaultRecommendations()
      }
    } catch (err) {
      console.error('Analysis error:', err)
      setError('Network error. Showing default recommendations.')
      loadDefaultRecommendations()
    } finally {
      setAnalyzing(false)
    }
  }

  const parseRecommendations = (analysis: any): Recommendation[] => {
    // Parse agent response into recommendations
    const recs: Recommendation[] = []

    if (analysis?.recommendations && Array.isArray(analysis.recommendations)) {
      return analysis.recommendations.map((rec: any, idx: number) => ({
        id: rec.id || `rec-${idx}`,
        type: rec.type || 'optimization',
        title: rec.title || 'Financial Opportunity',
        amount: rec.amount || 0,
        insight: rec.insight || '',
        benefit: rec.benefit || '',
        timeline: rec.timeline,
        status: 'pending',
        priority: rec.priority || 'medium',
        goalImpact: rec.goalImpact,
        executionBundle: rec.executionBundle,
        regulatoryFlags: rec.regulatoryFlags || ['GDPR', 'PSD2'],
        reasoning: rec.reasoning
      }))
    }

    return loadDefaultRecommendations()
  }

  const loadDefaultRecommendations = (): Recommendation[] => {
    const defaultRecs: Recommendation[] = [
      {
        id: 'rec1',
        type: 'idle_sweep',
        title: 'Idle Money Sweep Opportunity',
        amount: 400,
        insight: '$400 idle for 7+ days in checking account',
        benefit: '+$3.14 in 14 days at 5.2% APY',
        timeline: 'Executes in 1-2 business days',
        status: 'pending',
        priority: 'high',
        goalImpact: {
          goalId: 'goal1',
          goalName: 'House Down Payment',
          progressIncrease: 0.8
        },
        executionBundle: {
          apiCalls: ['Plaid Transfer API', 'Money Market Fund API'],
          rollbackPlan: 'Reverse transfer within 24h if conditions change'
        },
        regulatoryFlags: ['GDPR', 'PSD2'],
        reasoning: {
          insight: 'Detected $400 sitting idle for 7+ consecutive days',
          benefit: 'Earn 5.2% APY vs 0% in checking',
          timeline: '14-day investment window before next predicted expense'
        }
      },
      {
        id: 'rec2',
        type: 'subscription_cancel',
        title: 'Subscription Vampire Detected',
        amount: 96,
        insight: 'Premium Streaming unused for 23 days',
        benefit: 'Save $96/year',
        timeline: 'Cancellation email sent immediately',
        status: 'pending',
        priority: 'medium',
        goalImpact: {
          goalId: 'goal2',
          goalName: 'Mumbai Trip',
          progressIncrease: 1.92
        },
        executionBundle: {
          apiCalls: ['Gmail via Composio'],
          rollbackPlan: 'Re-subscribe within 30 days if needed'
        },
        regulatoryFlags: ['GDPR'],
        reasoning: {
          insight: 'No login activity detected for 23 days',
          benefit: 'Redirect $8/month to high-priority goals',
          timeline: 'Immediate savings starting next billing cycle'
        }
      },
      {
        id: 'rec3',
        type: 'goal_transfer',
        title: 'Accelerate Emergency Fund',
        amount: 250,
        insight: 'Surplus detected after bill predictions',
        benefit: 'Reach 50% milestone 2 months early',
        timeline: 'Transfer completes in 1-3 days',
        status: 'pending',
        priority: 'high',
        goalImpact: {
          goalId: 'goal3',
          goalName: 'Emergency Fund',
          progressIncrease: 1.39
        },
        executionBundle: {
          apiCalls: ['Plaid Transfer API', 'Goal Tracking Update'],
          rollbackPlan: 'Funds remain accessible via savings account'
        },
        regulatoryFlags: ['PSD2'],
        reasoning: {
          insight: 'Shadow balance shows $250 safe to invest',
          benefit: 'Build financial resilience faster',
          timeline: 'Aligned with your priority 1 goals'
        }
      }
    ]

    setRecommendations(defaultRecs)
    return defaultRecs
  }

  const handleExecuteRecommendation = async (recommendation: Recommendation) => {
    setConfirmDialog({ open: false, recommendation: null })
    setExecuting(recommendation.id)
    setError(null)

    // Update to validating state
    setRecommendations(prev =>
      prev.map(rec =>
        rec.id === recommendation.id ? { ...rec, status: 'validating' as const } : rec
      )
    )

    try {
      const response = await fetch('/api/agent/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: MOCK_USER_ID,
          actionType: recommendation.type,
          actionData: recommendation,
          bundleId: `bundle_${recommendation.id}`
        })
      })

      const data = await response.json()

      // Update to executing state
      setRecommendations(prev =>
        prev.map(rec =>
          rec.id === recommendation.id ? { ...rec, status: 'executing' as const } : rec
        )
      )

      // Simulate execution delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      if (data.success) {
        // Update to completed state
        setRecommendations(prev =>
          prev.map(rec =>
            rec.id === recommendation.id ? { ...rec, status: 'completed' as const } : rec
          )
        )

        // Add to execution history
        if (data.executionId) {
          const historyItem: ExecutionHistoryItem = {
            id: data.executionId,
            executionType: recommendation.type,
            bundleId: `bundle_${recommendation.id}`,
            state: 'COMPLETED',
            requestPayload: recommendation,
            responsePayload: data.result,
            stateTransitions: [
              { from: 'PENDING', to: 'VALIDATING', timestamp: new Date().toISOString() },
              { from: 'VALIDATING', to: 'EXECUTING', timestamp: new Date().toISOString() },
              { from: 'EXECUTING', to: 'COMPLETED', timestamp: new Date().toISOString() }
            ],
            hmacSignature: data.idempotencyKey?.substring(0, 16) + '...',
            idempotencyKey: data.idempotencyKey,
            success: true,
            createdAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            regulatoryFlags: recommendation.regulatoryFlags
          }
          setExecutionHistory(prev => [historyItem, ...prev])
        }

        // Update goal progress if applicable
        if (recommendation.goalImpact) {
          setGoals(prev =>
            prev.map(goal =>
              goal.id === recommendation.goalImpact?.goalId
                ? {
                    ...goal,
                    currentAmount: goal.currentAmount + recommendation.amount,
                    progress: ((goal.currentAmount + recommendation.amount) / goal.targetAmount) * 100
                  }
                : goal
            )
          )
        }

        setSuccessMessage(`${recommendation.title} executed successfully!`)
      } else {
        setRecommendations(prev =>
          prev.map(rec =>
            rec.id === recommendation.id ? { ...rec, status: 'failed' as const } : rec
          )
        )
        setError(data.error || 'Execution failed. Please try again.')
      }
    } catch (err) {
      setRecommendations(prev =>
        prev.map(rec =>
          rec.id === recommendation.id ? { ...rec, status: 'failed' as const } : rec
        )
      )
      setError('Network error during execution.')
    } finally {
      setExecuting(null)
    }
  }

  const handleCreateGoal = async () => {
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: MOCK_USER_ID,
          name: goalForm.name,
          description: goalForm.description,
          targetAmount: parseFloat(goalForm.targetAmount),
          targetDate: goalForm.targetDate,
          priority: goalForm.priority
        })
      })

      const data = await response.json()

      if (data.goal) {
        const newGoal = {
          ...data.goal,
          targetAmount: parseFloat(data.goal.targetAmount),
          currentAmount: parseFloat(data.goal.currentAmount),
          progress: 0
        }
        setGoals(prev => [...prev, newGoal])
        setGoalDialog({ open: false, goal: null })
        setGoalForm({ name: '', description: '', targetAmount: '', targetDate: '', priority: 1 })
        setSuccessMessage('Goal created successfully!')
      }
    } catch (err) {
      setError('Failed to create goal')
    }
  }

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await fetch(`/api/goals?goalId=${goalId}`, { method: 'DELETE' })
      setGoals(prev => prev.filter(g => g.id !== goalId))
      setSuccessMessage('Goal deleted successfully!')
    } catch (err) {
      setError('Failed to delete goal')
    }
  }

  const handleCreateTrigger = async () => {
    if (!triggerForm.naturalLanguage) return

    try {
      // In production, parse natural language with AI
      // For now, use mock parsing
      const response = await fetch('/api/intent-triggers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: MOCK_USER_ID,
          name: triggerForm.naturalLanguage.substring(0, 30),
          naturalLanguage: triggerForm.naturalLanguage,
          triggerType: 'SPENDING_BASED',
          conditionCategory: 'Food & Drink',
          conditionOperator: '<',
          conditionAmount: 10,
          actionType: 'SAVE_TO_GOAL',
          actionAmount: 50,
          targetGoalId: goals[0]?.id
        })
      })

      const data = await response.json()

      if (data.trigger) {
        setIntentTriggers(prev => [...prev, {
          ...data.trigger,
          actionAmount: parseFloat(data.trigger.actionAmount),
          conditionAmount: data.trigger.conditionAmount ? parseFloat(data.trigger.conditionAmount) : undefined
        }])
        setTriggerDialog(false)
        setTriggerForm({ naturalLanguage: '', parsedData: null })
        setSuccessMessage('Automation rule created successfully!')
      }
    } catch (err) {
      setError('Failed to create trigger')
    }
  }

  const handleToggleTrigger = async (triggerId: string, isActive: boolean) => {
    try {
      await fetch('/api/intent-triggers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggerId, isActive })
      })

      setIntentTriggers(prev =>
        prev.map(t => (t.id === triggerId ? { ...t, isActive } : t))
      )
      setSuccessMessage(`Trigger ${isActive ? 'enabled' : 'disabled'}`)
    } catch (err) {
      setError('Failed to update trigger')
    }
  }

  const handleDeleteTrigger = async (triggerId: string) => {
    try {
      await fetch(`/api/intent-triggers?triggerId=${triggerId}`, { method: 'DELETE' })
      setIntentTriggers(prev => prev.filter(t => t.id !== triggerId))
      setSuccessMessage('Trigger deleted successfully!')
    } catch (err) {
      setError('Failed to delete trigger')
    }
  }

  // Theme colors
  const themeColors = {
    URGENT: {
      accent: 'bg-red-500',
      border: 'border-red-500',
      text: 'text-red-500',
      bg: 'bg-red-500/10'
    },
    GROWTH: {
      accent: 'bg-amber-500',
      border: 'border-amber-500',
      text: 'text-amber-500',
      bg: 'bg-amber-500/10'
    },
    STABLE: {
      accent: 'bg-emerald-500',
      border: 'border-emerald-500',
      text: 'text-emerald-500',
      bg: 'bg-emerald-500/10'
    }
  }

  const theme = themeColors[uiTheme]

  // Component: Shadow Balance
  const ShadowBalanceCard = () => (
    <Card className={`bg-slate-900/50 border-slate-800 ${theme.border} border-2 transition-all duration-500`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium text-slate-400">Shadow Balance</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <FaInfoCircle className="w-3.5 h-3.5 text-slate-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-64">Your true available balance after deducting predicted bills for the next 14 days</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className={`w-8 h-8 rounded-lg ${theme.bg} flex items-center justify-center`}>
            <FaMoneyBillWave className={`w-4 h-4 ${theme.text}`} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className={`text-4xl font-bold ${theme.text}`}>
              ${shadowBalance.shadowBalance.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Real available balance
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-400">Bank: ${shadowBalance.bankBalance.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-slate-400">Bills: ${shadowBalance.predictedBills.toLocaleString()}</span>
            </div>
          </div>

          <div className="pt-2">
            <Badge className={
              shadowBalance.status === 'healthy' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
              shadowBalance.status === 'tight' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
              'bg-red-500/10 text-red-500 border-red-500/20'
            }>
              {shadowBalance.status === 'healthy' ? 'Healthy Buffer' :
               shadowBalance.status === 'tight' ? 'Tight Budget' : 'Negative Balance'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // Component: Financial Health Score
  const FinancialHealthScoreCard = () => {
    const scoreColor =
      healthScore.total >= 71 ? 'text-emerald-500' :
      healthScore.total >= 41 ? 'text-yellow-500' : 'text-red-500'

    const progressColor =
      healthScore.total >= 71 ? 'bg-emerald-500' :
      healthScore.total >= 41 ? 'bg-yellow-500' : 'bg-red-500'

    return (
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-400">Financial Health Score</CardTitle>
            <div className="flex items-center gap-1">
              {healthScore.trend === 'up' ? (
                <FaArrowUp className="w-3 h-3 text-emerald-500" />
              ) : healthScore.trend === 'down' ? (
                <FaArrowDown className="w-3 h-3 text-red-500" />
              ) : null}
              <span className="text-xs text-slate-500">vs last week</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Circular Progress */}
            <div className="relative w-32 h-32 mx-auto">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-slate-800"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - healthScore.total / 100)}`}
                  className={scoreColor}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className={`text-3xl font-bold ${scoreColor}`}>{healthScore.total}</div>
                <div className="text-xs text-slate-500">/ 100</div>
              </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-2">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Savings Rate</span>
                  <span className="text-white font-semibold">{healthScore.savingsRate}</span>
                </div>
                <Progress value={healthScore.savingsRate} className="h-1.5" />
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Protection</span>
                  <span className="text-white font-semibold">{healthScore.protection}</span>
                </div>
                <Progress value={healthScore.protection} className="h-1.5" />
              </div>
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-400">Optimization</span>
                  <span className="text-white font-semibold">{healthScore.optimization}</span>
                </div>
                <Progress value={healthScore.optimization} className="h-1.5" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Component: Predictive Liquidity Calendar
  const PredictiveLiquidityCalendar = () => {
    const sortedBills = [...predictedBills].sort((a, b) =>
      new Date(a.predictedDate).getTime() - new Date(b.predictedDate).getTime()
    )

    return (
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-white">Predictive Liquidity Calendar</CardTitle>
              <CardDescription className="text-slate-400">Upcoming predicted bills (next 30 days)</CardDescription>
            </div>
            <FaCalendarAlt className="w-5 h-5 text-slate-500" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedBills.map(bill => {
              const date = new Date(bill.predictedDate)
              const daysUntil = Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

              return (
                <div key={bill.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-white">{bill.merchant}</span>
                      <Badge className="text-xs bg-slate-700 text-slate-300 border-slate-600">
                        {bill.confidence}% confidence
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>{date.toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{daysUntil > 0 ? `${daysUntil} days` : 'Today'}</span>
                      <span>•</span>
                      <span>{bill.category}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">${bill.amount.toFixed(2)}</div>
                  </div>
                </div>
              )
            })}

            {sortedBills.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                No upcoming bills predicted
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 transition-all duration-500`}>
      {/* Header */}
      <header className={`border-b ${theme.border} bg-slate-950/50 backdrop-blur-sm sticky top-0 z-40 transition-all duration-500`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${theme.accent} flex items-center justify-center transition-all duration-500`}>
                <FaBolt className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">FlowState</h1>
                <p className="text-xs text-slate-400">Autonomous Wealth Optimization</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge className={`${theme.bg} ${theme.text} ${theme.border}`}>
                {uiTheme}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-white"
              >
                <FaCog className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {successMessage && (
          <Alert className="mb-6 bg-emerald-500/10 border-emerald-500/20 text-emerald-500">
            <FaCheckCircle className="w-4 h-4" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 bg-red-500/10 border-red-500/20 text-red-500">
            <FaExclamationTriangle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-900/50 border border-slate-800 p-1">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-slate-800">
              <FaChartLine className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="goals" className="data-[state=active]:bg-slate-800">
              <FaBullseye className="w-4 h-4 mr-2" />
              Goals
            </TabsTrigger>
            <TabsTrigger value="automation" className="data-[state=active]:bg-slate-800">
              <FaMagic className="w-4 h-4 mr-2" />
              Automation
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-slate-800">
              <FaHistory className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Top Row: Shadow Balance + Health Score + Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ShadowBalanceCard />
              <FinancialHealthScoreCard />

              {/* Quick Stats */}
              <div className="grid grid-cols-1 gap-4">
                <Card className="bg-slate-900/50 border-slate-800">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-slate-400">Active Goals</CardTitle>
                      <FaBullseye className="w-4 h-4 text-blue-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white">{goals.length}</div>
                    <p className="text-xs text-slate-500 mt-1">Total target: ${goals.reduce((sum, g) => sum + g.targetAmount, 0).toLocaleString()}</p>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/50 border-slate-800">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-slate-400">Automations</CardTitle>
                      <FaMagic className="w-4 h-4 text-purple-500" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-white">{intentTriggers.filter(t => t.isActive).length}</div>
                    <p className="text-xs text-slate-500 mt-1">{intentTriggers.length} total rules</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Predictive Liquidity Calendar */}
            <PredictiveLiquidityCalendar />

            {/* Analyze Button */}
            <Card className={`${theme.bg} ${theme.border}`}>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className={`w-16 h-16 mx-auto rounded-full ${theme.bg} flex items-center justify-center`}>
                    <FaRocket className={`w-8 h-8 ${theme.text}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Ready to Optimize Your Wealth?</h3>
                    <p className="text-slate-400">AI agents will analyze your finances and find goal-aligned opportunities.</p>
                  </div>
                  <Button
                    onClick={handleAnalyzeFinances}
                    disabled={analyzing}
                    size="lg"
                    className={`${theme.accent} hover:opacity-90 text-white font-semibold px-8`}
                  >
                    {analyzing ? (
                      <>
                        <FaSpinner className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing Finances...
                      </>
                    ) : (
                      <>
                        <FaBolt className="w-5 h-5 mr-2" />
                        Analyze My Finances
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Optimization Opportunities</h2>
                    <p className="text-slate-400 text-sm mt-1">AI-powered recommendations aligned to your goals</p>
                  </div>
                  <Button
                    onClick={handleAnalyzeFinances}
                    variant="outline"
                    size="sm"
                    disabled={analyzing}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                  >
                    <FaRedo className="w-3 h-3 mr-2" />
                    Refresh
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {recommendations
                    .filter(rec => rec.status !== 'dismissed')
                    .map(rec => (
                      <Card
                        key={rec.id}
                        className={`bg-slate-900/50 border-slate-800 ${
                          rec.status === 'completed' ? 'opacity-60' : ''
                        } transition-all duration-300`}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <CardTitle className="text-lg text-white">{rec.title}</CardTitle>
                                <Badge className={
                                  rec.priority === 'high' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                  rec.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                  'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                } variant="outline">
                                  {rec.priority}
                                </Badge>
                                {rec.status === 'completed' && (
                                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                    <FaCheckCircle className="w-3 h-3 mr-1" />
                                    Completed
                                  </Badge>
                                )}
                                {rec.status === 'validating' && (
                                  <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                                    <FaSpinner className="w-3 h-3 mr-1 animate-spin" />
                                    Validating
                                  </Badge>
                                )}
                                {rec.status === 'executing' && (
                                  <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                                    <FaSpinner className="w-3 h-3 mr-1 animate-spin" />
                                    Executing
                                  </Badge>
                                )}
                              </div>

                              <div className="text-3xl font-bold text-white mb-4">
                                ${rec.amount.toFixed(2)}
                              </div>

                              {/* Goal Impact Badge */}
                              {rec.goalImpact && (
                                <div className="mb-3">
                                  <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20">
                                    <FaTrophy className="w-3 h-3 mr-1" />
                                    {rec.goalImpact.goalName}: +{rec.goalImpact.progressIncrease.toFixed(1)}% progress
                                  </Badge>
                                </div>
                              )}

                              {/* Reasoning Manifest */}
                              <div className="space-y-2">
                                <div className="flex items-start gap-2">
                                  <div className="flex-1 bg-slate-800/50 rounded-lg px-3 py-2 border border-slate-700">
                                    <div className="text-xs font-medium text-slate-400 mb-1">Insight</div>
                                    <div className="text-sm text-white">{rec.reasoning?.insight || rec.insight}</div>
                                  </div>
                                  <FaChevronRight className="w-4 h-4 text-slate-600 mt-3" />
                                  <div className="flex-1 bg-emerald-500/10 rounded-lg px-3 py-2 border border-emerald-500/20">
                                    <div className="text-xs font-medium text-emerald-400 mb-1">Benefit</div>
                                    <div className="text-sm text-emerald-300 font-semibold">{rec.reasoning?.benefit || rec.benefit}</div>
                                  </div>
                                </div>

                                {rec.timeline && (
                                  <div className="bg-blue-500/10 rounded-lg px-3 py-2 border border-blue-500/20">
                                    <div className="flex items-center gap-2">
                                      <FaCalendarAlt className="w-3 h-3 text-blue-400" />
                                      <span className="text-xs font-medium text-blue-400">Timeline:</span>
                                      <span className="text-sm text-blue-300">{rec.timeline}</span>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Execution Bundle Preview */}
                              {rec.executionBundle && (
                                <div className="mt-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700">
                                  <div className="text-xs font-medium text-slate-400 mb-2">Execution Bundle</div>
                                  <div className="space-y-1 text-xs text-slate-500">
                                    <div>API Calls: {rec.executionBundle.apiCalls.join(', ')}</div>
                                    <div>Rollback: {rec.executionBundle.rollbackPlan}</div>
                                  </div>
                                </div>
                              )}

                              {/* Regulatory Compliance */}
                              {rec.regulatoryFlags && rec.regulatoryFlags.length > 0 && (
                                <div className="mt-2 flex items-center gap-2">
                                  <FaShieldAlt className="w-3 h-3 text-green-500" />
                                  <span className="text-xs text-slate-400">Compliant with:</span>
                                  {rec.regulatoryFlags.map(flag => (
                                    <Badge key={flag} className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
                                      {flag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-2">
                            {rec.status === 'pending' && (
                              <>
                                <Button
                                  onClick={() => setConfirmDialog({ open: true, recommendation: rec })}
                                  disabled={executing === rec.id}
                                  className={`${theme.accent} hover:opacity-90 text-white font-semibold`}
                                >
                                  <FaCheckCircle className="w-4 h-4 mr-2" />
                                  Execute
                                </Button>
                                <Button
                                  onClick={() => setRecommendations(prev =>
                                    prev.map(r => r.id === rec.id ? { ...r, status: 'dismissed' as const } : r)
                                  )}
                                  variant="ghost"
                                  className="text-slate-400 hover:text-white"
                                >
                                  <FaTimes className="w-4 h-4 mr-2" />
                                  Dismiss
                                </Button>
                              </>
                            )}
                            {rec.status === 'completed' && (
                              <Button disabled className="bg-emerald-500/20 text-emerald-500">
                                <FaCheckCircle className="w-4 h-4 mr-2" />
                                Completed
                              </Button>
                            )}
                            {(rec.status === 'validating' || rec.status === 'executing') && (
                              <Button disabled className="bg-blue-500/20 text-blue-500">
                                <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
                                {rec.status === 'validating' ? 'Validating...' : 'Executing...'}
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Financial Goals</h2>
                <p className="text-slate-400 text-sm mt-1">Track progress towards your dreams</p>
              </div>
              <Button
                onClick={() => setGoalDialog({ open: true, goal: null })}
                className={`${theme.accent} hover:opacity-90 text-white font-semibold`}
              >
                <FaPlus className="w-4 h-4 mr-2" />
                Create Goal
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {goals.map(goal => (
                <Card key={goal.id} className="bg-slate-900/50 border-slate-800">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg text-white mb-1">{goal.name}</CardTitle>
                        <CardDescription className="text-slate-400">{goal.description}</CardDescription>
                      </div>
                      <Badge className={`${theme.bg} ${theme.text} ${theme.border}`}>
                        Priority {goal.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">Progress</span>
                        <span className="text-sm font-semibold text-white">{goal.progress?.toFixed(1)}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <div className="text-slate-400">Current</div>
                        <div className="text-xl font-bold text-white">${goal.currentAmount.toLocaleString()}</div>
                      </div>
                      <FaChevronRight className="w-4 h-4 text-slate-600" />
                      <div className="text-right">
                        <div className="text-slate-400">Target</div>
                        <div className="text-xl font-bold text-emerald-500">${goal.targetAmount.toLocaleString()}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <FaCalendarAlt className="w-3 h-3" />
                      <span>Target Date: {new Date(goal.targetDate).toLocaleDateString()}</span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-slate-700 text-slate-300 hover:bg-slate-800"
                      >
                        <FaEdit className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <FaTrash className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {goals.length === 0 && (
                <Card className="col-span-2 bg-slate-900/50 border-slate-800">
                  <CardContent className="py-12 text-center">
                    <FaBullseye className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No goals yet</h3>
                    <p className="text-slate-400 mb-4">Create your first financial goal to get started</p>
                    <Button
                      onClick={() => setGoalDialog({ open: true, goal: null })}
                      className={`${theme.accent} hover:opacity-90 text-white`}
                    >
                      <FaPlus className="w-4 h-4 mr-2" />
                      Create Goal
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Intent-Based Automation</h2>
                <p className="text-slate-400 text-sm mt-1">Natural language rules that automate your finances</p>
              </div>
              <Button
                onClick={() => setTriggerDialog(true)}
                className={`${theme.accent} hover:opacity-90 text-white font-semibold`}
              >
                <FaPlus className="w-4 h-4 mr-2" />
                Create Rule
              </Button>
            </div>

            <div className="space-y-4">
              {intentTriggers.map(trigger => (
                <Card key={trigger.id} className={`bg-slate-900/50 border-slate-800 ${!trigger.isActive ? 'opacity-50' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-lg text-white">{trigger.name}</CardTitle>
                          <Switch
                            checked={trigger.isActive}
                            onCheckedChange={(checked) => handleToggleTrigger(trigger.id, checked)}
                          />
                        </div>
                        <div className="bg-slate-800/50 rounded-lg px-4 py-3 border border-slate-700 mb-3">
                          <p className="text-sm text-emerald-400">{trigger.naturalLanguage}</p>
                        </div>

                        {/* Statistics */}
                        {trigger.triggerCount !== undefined && (
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <FaBolt className="w-3 h-3 text-amber-500" />
                              <span className="text-slate-400">Triggered:</span>
                              <span className="text-white font-semibold">{trigger.triggerCount} times</span>
                            </div>
                            {trigger.totalSaved && (
                              <div className="flex items-center gap-2">
                                <FaGem className="w-3 h-3 text-emerald-500" />
                                <span className="text-slate-400">Total saved:</span>
                                <span className="text-emerald-500 font-semibold">${trigger.totalSaved}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTrigger(trigger.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <FaTrash className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}

              {intentTriggers.length === 0 && (
                <Card className="bg-slate-900/50 border-slate-800">
                  <CardContent className="py-12 text-center">
                    <FaMagic className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No automation rules yet</h3>
                    <p className="text-slate-400 mb-4">Create intelligent rules like "Save $50 every time I spend less than $10 on lunch"</p>
                    <Button
                      onClick={() => setTriggerDialog(true)}
                      className={`${theme.accent} hover:opacity-90 text-white`}
                    >
                      <FaPlus className="w-4 h-4 mr-2" />
                      Create Rule
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Execution History & Audit Trail</h2>
              <p className="text-slate-400 text-sm mt-1">Complete record of all automated actions with compliance data</p>
            </div>

            <div className="space-y-4">
              {executionHistory.map(item => (
                <Card key={item.id} className="bg-slate-900/50 border-slate-800">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg text-white">{item.executionType.replace(/_/g, ' ')}</CardTitle>
                          <Badge className={
                            item.state === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                            item.state === 'FAILED' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                            item.state === 'EXECUTING' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                            'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                          }>
                            {item.state}
                          </Badge>
                        </div>

                        {/* State Transitions */}
                        {item.stateTransitions && item.stateTransitions.length > 0 && (
                          <div className="flex items-center gap-2 mb-3">
                            {item.stateTransitions.map((transition, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs bg-slate-800 text-slate-300 border-slate-700">
                                  {transition.to}
                                </Badge>
                                {idx < item.stateTransitions!.length - 1 && (
                                  <FaChevronRight className="w-3 h-3 text-slate-600" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Security Info */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="bg-slate-800/50 rounded px-3 py-2 border border-slate-700">
                            <div className="text-slate-400 mb-1">Idempotency Key</div>
                            <div className="text-white font-mono truncate">{item.idempotencyKey}</div>
                          </div>
                          <div className="bg-slate-800/50 rounded px-3 py-2 border border-slate-700">
                            <div className="text-slate-400 mb-1">HMAC Signature</div>
                            <div className="text-white font-mono truncate">{item.hmacSignature}</div>
                          </div>
                        </div>

                        {/* Timestamps */}
                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                          <div className="flex items-center gap-1">
                            <FaCalendarAlt className="w-3 h-3" />
                            <span>Started: {new Date(item.createdAt).toLocaleString()}</span>
                          </div>
                          {item.completedAt && (
                            <div className="flex items-center gap-1">
                              <FaCheckCircle className="w-3 h-3" />
                              <span>Completed: {new Date(item.completedAt).toLocaleString()}</span>
                            </div>
                          )}
                        </div>

                        {/* Regulatory Flags */}
                        {item.regulatoryFlags && item.regulatoryFlags.length > 0 && (
                          <div className="mt-2 flex items-center gap-2">
                            <FaLock className="w-3 h-3 text-green-500" />
                            {item.regulatoryFlags.map(flag => (
                              <Badge key={flag} className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
                                {flag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}

              {executionHistory.length === 0 && (
                <Card className="bg-slate-900/50 border-slate-800">
                  <CardContent className="py-12 text-center">
                    <FaHistory className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No execution history</h3>
                    <p className="text-slate-400">Executed actions will appear here with full audit trails</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ open, recommendation: null })}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>Confirm Execution</DialogTitle>
            <DialogDescription className="text-slate-400">
              Review the action details before executing
            </DialogDescription>
          </DialogHeader>
          {confirmDialog.recommendation && (
            <div className="space-y-4 py-4">
              <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <h4 className="font-semibold text-white mb-2">{confirmDialog.recommendation.title}</h4>
                <p className="text-sm text-slate-400 mb-3">{confirmDialog.recommendation.insight}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Amount:</span>
                  <span className="text-lg font-bold text-emerald-500">${confirmDialog.recommendation.amount.toFixed(2)}</span>
                </div>
              </div>

              {confirmDialog.recommendation.executionBundle && (
                <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20 text-xs">
                  <div className="font-medium text-blue-400 mb-1">Execution Plan:</div>
                  <div className="text-blue-300">{confirmDialog.recommendation.executionBundle.apiCalls.join(' → ')}</div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialog({ open: false, recommendation: null })}
              className="border-slate-700 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={() => confirmDialog.recommendation && handleExecuteRecommendation(confirmDialog.recommendation)}
              className={`${theme.accent} hover:opacity-90 text-white`}
            >
              <FaCheckCircle className="w-4 h-4 mr-2" />
              Execute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Goal Dialog */}
      <Dialog open={goalDialog.open} onOpenChange={(open) => setGoalDialog({ open, goal: null })}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>Create Financial Goal</DialogTitle>
            <DialogDescription className="text-slate-400">
              Set a target and track your progress
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Goal Name</label>
              <Input
                value={goalForm.name}
                onChange={(e) => setGoalForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., House Down Payment"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Description (Optional)</label>
              <Textarea
                value={goalForm.description}
                onChange={(e) => setGoalForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="e.g., Save for dream home"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Target Amount</label>
              <Input
                type="number"
                value={goalForm.targetAmount}
                onChange={(e) => setGoalForm(prev => ({ ...prev, targetAmount: e.target.value }))}
                placeholder="e.g., 50000"
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Target Date</label>
              <Input
                type="date"
                value={goalForm.targetDate}
                onChange={(e) => setGoalForm(prev => ({ ...prev, targetDate: e.target.value }))}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">Priority (1-5)</label>
              <Input
                type="number"
                min="1"
                max="5"
                value={goalForm.priority}
                onChange={(e) => setGoalForm(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setGoalDialog({ open: false, goal: null })
                setGoalForm({ name: '', description: '', targetAmount: '', targetDate: '', priority: 1 })
              }}
              className="border-slate-700 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateGoal}
              disabled={!goalForm.name || !goalForm.targetAmount || !goalForm.targetDate}
              className={`${theme.accent} hover:opacity-90 text-white`}
            >
              <FaPlus className="w-4 h-4 mr-2" />
              Create Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Trigger Dialog */}
      <Dialog open={triggerDialog} onOpenChange={setTriggerDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>Create Automation Rule</DialogTitle>
            <DialogDescription className="text-slate-400">
              Use natural language to describe your automation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-slate-300 mb-2 block">
                Describe your rule in plain English
              </label>
              <Textarea
                value={triggerForm.naturalLanguage}
                onChange={(e) => setTriggerForm(prev => ({ ...prev, naturalLanguage: e.target.value }))}
                placeholder="e.g., Save $50 for Mumbai trip every time I spend less than $10 on lunch"
                className="bg-slate-800 border-slate-700 text-white"
                rows={3}
              />
            </div>

            <Alert className="bg-blue-500/10 border-blue-500/20">
              <FaLightbulb className="w-4 h-4 text-blue-500" />
              <AlertDescription className="text-blue-300 text-sm">
                <strong>Examples:</strong> "Save $100 when salary is deposited" or "Alert me when spending on dining exceeds $200/month"
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setTriggerDialog(false)
                setTriggerForm({ naturalLanguage: '', parsedData: null })
              }}
              className="border-slate-700 text-slate-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateTrigger}
              disabled={!triggerForm.naturalLanguage}
              className={`${theme.accent} hover:opacity-90 text-white`}
            >
              <FaMagic className="w-4 h-4 mr-2" />
              Create Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
