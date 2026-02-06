'use client'

/**
 * FlowState Autonomous Wealth Optimization Platform
 * Main Dashboard - Central command for financial optimization
 */

import { useState, useEffect } from 'react'
import { callAIAgent, type NormalizedAgentResponse } from '@/lib/aiAgent'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
  FaChevronLeft,
  FaCog,
  FaRedo,
  FaBolt,
  FaShieldAlt,
  FaRocket
} from 'react-icons/fa'

// Agent IDs from workflow
const AGENTS = {
  WEALTH_ARCHITECT: '698586be382ef8715224cf22',
  DATA_CRUNCHER: '69858660382ef8715224cf1d',
  MARKET_STRATEGIST: '6985867f49f279d47448a5c3',
  EXECUTIONER: '698586981caa4e686dd66dba'
}

// TypeScript interfaces based on expected agent responses
interface Recommendation {
  id: string
  type: 'idle_sweep' | 'subscription_cancel' | 'anomaly_refund' | 'tax_optimization' | 'investment_rebalance'
  title: string
  amount: number
  insight: string
  benefit: string
  status: 'pending' | 'executing' | 'completed' | 'dismissed'
  details: {
    fund?: string
    apy?: number
    days?: number
    yield?: number
    service?: string
    merchant?: string
    daysUnused?: number
    annualSavings?: number
    refundAmount?: number
    transactionDate?: string
  }
  actionLabel: string
  priority: 'high' | 'medium' | 'low'
}

interface FinancialMetrics {
  surplusCapital: number
  burnRate: number
  potentialYield: number
  monthlyIncome: number
  monthlyExpenses: number
  savingsRate: number
}

interface Transaction {
  id: string
  merchant: string
  amount: number
  date: string
  category: string
  status: 'completed' | 'pending' | 'flagged'
  flagReason?: string
}

export default function Home() {
  // State management
  const [metrics, setMetrics] = useState<FinancialMetrics>({
    surplusCapital: 0,
    burnRate: 0,
    potentialYield: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    savingsRate: 0
  })
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [executing, setExecuting] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    recommendation: Recommendation | null
  }>({ open: false, recommendation: null })
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hasAnalyzed, setHasAnalyzed] = useState(false)

  // Auto-dismiss success/error messages
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage(null)
        setError(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [successMessage, error])

  // Parse agent response into structured recommendations
  const parseAgentResponse = (response: NormalizedAgentResponse): Recommendation[] => {
    try {
      const result = response.result
      const recs: Recommendation[] = []

      // Check for recommendations array in response
      if (result.recommendations && Array.isArray(result.recommendations)) {
        return result.recommendations.map((rec: any, idx: number) => ({
          id: rec.id || `rec-${idx}`,
          type: rec.type || 'idle_sweep',
          title: rec.title || 'Financial Opportunity',
          amount: rec.amount || 0,
          insight: rec.insight || '',
          benefit: rec.benefit || '',
          status: 'pending',
          details: rec.details || {},
          actionLabel: rec.actionLabel || 'Execute',
          priority: rec.priority || 'medium'
        }))
      }

      // Fallback: Parse from message or text
      const text = response.message || result.message || result.text || JSON.stringify(result)

      // Look for idle money patterns
      if (text.toLowerCase().includes('idle') || text.toLowerCase().includes('surplus')) {
        recs.push({
          id: 'idle-sweep-1',
          type: 'idle_sweep',
          title: 'Idle Money Sweep Opportunity',
          amount: extractAmount(text) || 400,
          insight: '$400 idle for 7+ days',
          benefit: '+$3.14 in 14 days at 5.2% APY',
          status: 'pending',
          details: {
            fund: 'SWVXX Money Market Fund',
            apy: 5.2,
            days: 14,
            yield: 3.14
          },
          actionLabel: 'Execute Sweep',
          priority: 'high'
        })
      }

      // Look for subscription patterns
      if (text.toLowerCase().includes('subscription') || text.toLowerCase().includes('recurring')) {
        recs.push({
          id: 'sub-cancel-1',
          type: 'subscription_cancel',
          title: 'Subscription Vampire Detected',
          amount: 96,
          insight: 'Streaming service unused for 23 days',
          benefit: 'Save $96/year',
          status: 'pending',
          details: {
            service: 'Premium Streaming',
            daysUnused: 23,
            annualSavings: 96
          },
          actionLabel: 'Send Cancellation',
          priority: 'medium'
        })
      }

      // Look for duplicate/anomaly patterns
      if (text.toLowerCase().includes('duplicate') || text.toLowerCase().includes('anomaly') || text.toLowerCase().includes('refund')) {
        recs.push({
          id: 'anomaly-1',
          type: 'anomaly_refund',
          title: 'Duplicate Charge Detected',
          amount: 24.99,
          insight: 'Same merchant charged twice in 2 hours',
          benefit: 'Refund request prepared',
          status: 'pending',
          details: {
            merchant: 'Coffee Shop',
            refundAmount: 24.99,
            transactionDate: new Date().toISOString()
          },
          actionLabel: 'Request Refund',
          priority: 'high'
        })
      }

      return recs.length > 0 ? recs : generateDefaultRecommendations()
    } catch (err) {
      console.error('Error parsing agent response:', err)
      return generateDefaultRecommendations()
    }
  }

  // Extract dollar amount from text
  const extractAmount = (text: string): number | null => {
    const match = text.match(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)/)
    return match ? parseFloat(match[1].replace(/,/g, '')) : null
  }

  // Generate default recommendations for demo
  const generateDefaultRecommendations = (): Recommendation[] => [
    {
      id: 'idle-sweep-1',
      type: 'idle_sweep',
      title: 'Idle Money Sweep Opportunity',
      amount: 400,
      insight: '$400 idle for 7+ days',
      benefit: '+$3.14 in 14 days at 5.2% APY',
      status: 'pending',
      details: {
        fund: 'SWVXX Money Market Fund',
        apy: 5.2,
        days: 14,
        yield: 3.14
      },
      actionLabel: 'Execute Sweep',
      priority: 'high'
    },
    {
      id: 'sub-cancel-1',
      type: 'subscription_cancel',
      title: 'Subscription Vampire Detected',
      amount: 96,
      insight: 'Premium Streaming unused for 23 days',
      benefit: 'Save $96/year',
      status: 'pending',
      details: {
        service: 'Premium Streaming',
        daysUnused: 23,
        annualSavings: 96
      },
      actionLabel: 'Send Cancellation',
      priority: 'medium'
    },
    {
      id: 'anomaly-1',
      type: 'anomaly_refund',
      title: 'Duplicate Charge Detected',
      amount: 24.99,
      insight: 'Coffee Shop charged twice in 2 hours',
      benefit: 'Refund request prepared',
      status: 'pending',
      details: {
        merchant: 'Coffee Shop',
        refundAmount: 24.99,
        transactionDate: new Date().toISOString()
      },
      actionLabel: 'Request Refund',
      priority: 'high'
    }
  ]

  // Generate mock transactions
  const generateMockTransactions = (): Transaction[] => [
    { id: 't1', merchant: 'Coffee Shop', amount: -24.99, date: '2026-02-06', category: 'Food & Drink', status: 'flagged', flagReason: 'Duplicate' },
    { id: 't2', merchant: 'Premium Streaming', amount: -7.99, date: '2026-02-05', category: 'Entertainment', status: 'completed' },
    { id: 't3', merchant: 'Grocery Store', amount: -142.35, date: '2026-02-05', category: 'Groceries', status: 'completed' },
    { id: 't4', merchant: 'Paycheck Deposit', amount: 3250.00, date: '2026-02-01', category: 'Income', status: 'completed' },
    { id: 't5', merchant: 'Gas Station', amount: -45.00, date: '2026-01-31', category: 'Transportation', status: 'completed' },
    { id: 't6', merchant: 'Coffee Shop', amount: -24.99, date: '2026-02-06', category: 'Food & Drink', status: 'flagged', flagReason: 'Duplicate' },
  ]

  // Main analysis function - calls Wealth Architect Manager
  const handleAnalyzeFinances = async () => {
    setAnalyzing(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const result = await callAIAgent(
        'Analyze my financial situation and provide wealth optimization recommendations. Look for idle money that can be swept into money market funds, unused subscriptions that should be cancelled, and any duplicate charges or anomalies that need refunds.',
        AGENTS.WEALTH_ARCHITECT
      )

      if (result.success) {
        // Parse recommendations from agent response
        const parsedRecs = parseAgentResponse(result.response)
        setRecommendations(parsedRecs)

        // Update metrics based on recommendations
        const totalPotential = parsedRecs.reduce((sum, rec) => sum + (rec.amount || 0), 0)
        setMetrics(prev => ({
          ...prev,
          surplusCapital: 400,
          burnRate: 85,
          potentialYield: totalPotential,
          monthlyIncome: 3250,
          monthlyExpenses: 2762.5,
          savingsRate: 15
        }))

        // Generate transactions
        setTransactions(generateMockTransactions())

        setSuccessMessage('Financial analysis complete! Review your optimization opportunities below.')
        setHasAnalyzed(true)
      } else {
        setError(result.error || 'Analysis failed. Please try again.')
        // Still show default recommendations for demo
        setRecommendations(generateDefaultRecommendations())
        setTransactions(generateMockTransactions())
        setMetrics({
          surplusCapital: 400,
          burnRate: 85,
          potentialYield: 124.13,
          monthlyIncome: 3250,
          monthlyExpenses: 2762.5,
          savingsRate: 15
        })
      }
    } catch (err) {
      setError('Network error. Please check your connection.')
      // Show default recommendations for demo
      setRecommendations(generateDefaultRecommendations())
      setTransactions(generateMockTransactions())
    } finally {
      setAnalyzing(false)
    }
  }

  // Execute a recommendation
  const handleExecuteRecommendation = async (recommendation: Recommendation) => {
    setConfirmDialog({ open: false, recommendation: null })
    setExecuting(recommendation.id)
    setError(null)

    try {
      // Call the Executioner Agent
      const message = `Execute ${recommendation.type}: ${recommendation.title}. Details: ${JSON.stringify(recommendation.details)}`
      const result = await callAIAgent(message, AGENTS.EXECUTIONER)

      if (result.success) {
        // Update recommendation status
        setRecommendations(prev =>
          prev.map(rec =>
            rec.id === recommendation.id
              ? { ...rec, status: 'completed' }
              : rec
          )
        )

        // Update metrics
        if (recommendation.type === 'idle_sweep') {
          setMetrics(prev => ({
            ...prev,
            surplusCapital: prev.surplusCapital - recommendation.amount
          }))
        }

        setSuccessMessage(`${recommendation.title} executed successfully!`)
      } else {
        setError(result.error || 'Execution failed. Please try again.')
      }
    } catch (err) {
      setError('Network error during execution.')
    } finally {
      setExecuting(null)
    }
  }

  // Dismiss a recommendation
  const handleDismissRecommendation = (id: string) => {
    setRecommendations(prev =>
      prev.map(rec =>
        rec.id === id ? { ...rec, status: 'dismissed' } : rec
      )
    )
  }

  // Get icon for recommendation type
  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'idle_sweep':
        return <FaDollarSign className="w-6 h-6" />
      case 'subscription_cancel':
        return <FaCreditCard className="w-6 h-6" />
      case 'anomaly_refund':
        return <FaExclamationTriangle className="w-6 h-6" />
      default:
        return <FaLightbulb className="w-6 h-6" />
    }
  }

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'low':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <FaBolt className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">FlowState</h1>
                <p className="text-xs text-slate-400">Autonomous Wealth Optimization</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.location.href = '/settings'}
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
        <div className="flex gap-6">
          {/* Main Dashboard Area */}
          <div className="flex-1 space-y-8">
            {/* Success/Error Messages */}
            {successMessage && (
              <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-500">
                <FaCheckCircle className="w-4 h-4" />
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="bg-red-500/10 border-red-500/20 text-red-500">
                <FaExclamationTriangle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Surplus Capital */}
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-slate-400">Surplus Capital</CardTitle>
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <FaDollarSign className="w-4 h-4 text-emerald-500" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">${metrics.surplusCapital.toFixed(0)}</div>
                  <p className="text-xs text-slate-500 mt-1">Available to optimize</p>
                </CardContent>
              </Card>

              {/* Burn Rate */}
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-slate-400">Burn Rate</CardTitle>
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <FaFireAlt className="w-4 h-4 text-orange-500" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white">{metrics.burnRate}%</div>
                  <Progress value={metrics.burnRate} className="mt-2 h-1.5" />
                  <p className="text-xs text-slate-500 mt-1">Of monthly income</p>
                </CardContent>
              </Card>

              {/* Potential Yield */}
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-slate-400">Potential Yield</CardTitle>
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <FaChartLine className="w-4 h-4 text-emerald-500" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-emerald-500">+${metrics.potentialYield.toFixed(0)}/yr</div>
                  <p className="text-xs text-slate-500 mt-1">From optimizations</p>
                </CardContent>
              </Card>
            </div>

            {/* Analyze Button */}
            {!hasAnalyzed && (
              <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <FaRocket className="w-8 h-8 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Ready to Optimize Your Wealth?</h3>
                      <p className="text-slate-400">Let our AI agents analyze your finances and find opportunities to grow your money.</p>
                    </div>
                    <Button
                      onClick={handleAnalyzeFinances}
                      disabled={analyzing}
                      size="lg"
                      className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8"
                    >
                      {analyzing ? (
                        <>
                          <FaSpinner className="w-5 h-5 mr-2 animate-spin" />
                          Analyzing Your Finances...
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
            )}

            {/* Recommendations Grid */}
            {recommendations.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Optimization Opportunities</h2>
                    <p className="text-slate-400 text-sm mt-1">AI-powered recommendations to maximize your wealth</p>
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
                    .map(recommendation => (
                      <Card
                        key={recommendation.id}
                        className={`bg-slate-900/50 border-slate-800 ${
                          recommendation.status === 'completed' ? 'opacity-60' : ''
                        }`}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                recommendation.type === 'idle_sweep' ? 'bg-emerald-500/10 text-emerald-500' :
                                recommendation.type === 'subscription_cancel' ? 'bg-purple-500/10 text-purple-500' :
                                'bg-red-500/10 text-red-500'
                              }`}>
                                {getRecommendationIcon(recommendation.type)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <CardTitle className="text-lg text-white">{recommendation.title}</CardTitle>
                                  <Badge className={getPriorityColor(recommendation.priority)} variant="outline">
                                    {recommendation.priority}
                                  </Badge>
                                  {recommendation.status === 'completed' && (
                                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                                      <FaCheckCircle className="w-3 h-3 mr-1" />
                                      Completed
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-2xl font-bold text-white mb-3">
                                  ${recommendation.amount.toFixed(2)}
                                </div>

                                {/* Reasoning Manifest */}
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-slate-800/50 rounded-lg px-3 py-2 border border-slate-700">
                                      <div className="text-xs font-medium text-slate-400 mb-1">Insight</div>
                                      <div className="text-sm text-white">{recommendation.insight}</div>
                                    </div>
                                    <FaChevronRight className="w-4 h-4 text-slate-600" />
                                    <div className="flex-1 bg-emerald-500/10 rounded-lg px-3 py-2 border border-emerald-500/20">
                                      <div className="text-xs font-medium text-emerald-400 mb-1">Benefit</div>
                                      <div className="text-sm text-emerald-300 font-semibold">{recommendation.benefit}</div>
                                    </div>
                                  </div>

                                  {/* Additional Details */}
                                  {recommendation.details && (
                                    <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                                      {recommendation.details.fund && (
                                        <div className="flex items-center gap-1">
                                          <FaShieldAlt className="w-3 h-3" />
                                          <span>{recommendation.details.fund}</span>
                                        </div>
                                      )}
                                      {recommendation.details.apy && (
                                        <div className="flex items-center gap-1">
                                          <FaChartLine className="w-3 h-3" />
                                          <span>{recommendation.details.apy}% APY</span>
                                        </div>
                                      )}
                                      {recommendation.details.service && (
                                        <div className="flex items-center gap-1">
                                          <FaCreditCard className="w-3 h-3" />
                                          <span>{recommendation.details.service}</span>
                                        </div>
                                      )}
                                      {recommendation.details.daysUnused && (
                                        <div className="flex items-center gap-1">
                                          <span>Unused: {recommendation.details.daysUnused} days</span>
                                        </div>
                                      )}
                                      {recommendation.details.merchant && (
                                        <div className="flex items-center gap-1">
                                          <span>Merchant: {recommendation.details.merchant}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-2">
                            {recommendation.status !== 'completed' && (
                              <>
                                <Button
                                  onClick={() => setConfirmDialog({ open: true, recommendation })}
                                  disabled={executing === recommendation.id}
                                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
                                >
                                  {executing === recommendation.id ? (
                                    <>
                                      <FaSpinner className="w-4 h-4 mr-2 animate-spin" />
                                      Executing...
                                    </>
                                  ) : (
                                    <>
                                      <FaCheckCircle className="w-4 h-4 mr-2" />
                                      {recommendation.actionLabel}
                                    </>
                                  )}
                                </Button>
                                <Button
                                  onClick={() => handleDismissRecommendation(recommendation.id)}
                                  variant="ghost"
                                  className="text-slate-400 hover:text-white"
                                >
                                  <FaTimes className="w-4 h-4 mr-2" />
                                  Dismiss
                                </Button>
                              </>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Transaction Sidebar */}
          {transactions.length > 0 && (
            <div className={`${sidebarOpen ? 'w-80' : 'w-12'} transition-all duration-300`}>
              <Card className="bg-slate-900/50 border-slate-800 sticky top-24">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    {sidebarOpen ? (
                      <>
                        <CardTitle className="text-sm font-medium text-slate-400">Recent Transactions</CardTitle>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSidebarOpen(false)}
                          className="text-slate-400 hover:text-white h-6 w-6"
                        >
                          <FaChevronRight className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSidebarOpen(true)}
                        className="text-slate-400 hover:text-white h-6 w-6"
                      >
                        <FaChevronLeft className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                {sidebarOpen && (
                  <CardContent>
                    <div className="space-y-3">
                      {transactions.slice(0, 8).map(transaction => (
                        <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-slate-800 last:border-0">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-white truncate">{transaction.merchant}</p>
                              {transaction.status === 'flagged' && (
                                <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-xs">
                                  {transaction.flagReason}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-500">{transaction.date}</p>
                          </div>
                          <div className={`text-sm font-semibold ${
                            transaction.amount > 0 ? 'text-emerald-500' : 'text-white'
                          }`}>
                            {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ open, recommendation: null })}>
        <DialogContent className="bg-slate-900 border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to execute this recommendation?
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
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              Confirm Execution
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
