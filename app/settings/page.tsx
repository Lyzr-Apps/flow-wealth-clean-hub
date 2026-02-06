'use client'

/**
 * FlowState Settings & Configuration
 * Risk profile and notification preferences
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  FaShieldAlt,
  FaRocket,
  FaBell,
  FaArrowLeft,
  FaCheckCircle,
  FaChartLine,
  FaDollarSign,
  FaExclamationTriangle
} from 'react-icons/fa'

export default function SettingsPage() {
  // State for settings
  const [riskProfile, setRiskProfile] = useState<'conservative' | 'aggressive'>('conservative')
  const [idleThreshold, setIdleThreshold] = useState(15)
  const [autoExecute, setAutoExecute] = useState(false)
  const [notifications, setNotifications] = useState({
    idleMoney: true,
    subscriptions: true,
    anomalies: true,
    weeklyReport: false
  })
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('flowstate-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setRiskProfile(parsed.riskProfile || 'conservative')
        setIdleThreshold(parsed.idleThreshold || 15)
        setAutoExecute(parsed.autoExecute || false)
        setNotifications(parsed.notifications || {
          idleMoney: true,
          subscriptions: true,
          anomalies: true,
          weeklyReport: false
        })
      } catch (err) {
        console.error('Error loading settings:', err)
      }
    }
  }, [])

  // Save settings
  const handleSaveSettings = () => {
    const settings = {
      riskProfile,
      idleThreshold,
      autoExecute,
      notifications
    }
    localStorage.setItem('flowstate-settings', JSON.stringify(settings))
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.location.href = '/'}
              className="text-slate-400 hover:text-white"
            >
              <FaArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-white">Settings</h1>
              <p className="text-xs text-slate-400">Configure your wealth optimization preferences</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Success Message */}
          {saveSuccess && (
            <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-500">
              <FaCheckCircle className="w-4 h-4" />
              <AlertDescription>Settings saved successfully!</AlertDescription>
            </Alert>
          )}

          {/* Risk Profile Card */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FaChartLine className="w-5 h-5 text-emerald-500" />
                Risk Profile
              </CardTitle>
              <CardDescription className="text-slate-400">
                Choose your investment approach and optimization strategy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Conservative Option */}
                <button
                  onClick={() => setRiskProfile('conservative')}
                  className={`text-left p-6 rounded-lg border-2 transition-all ${
                    riskProfile === 'conservative'
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <FaShieldAlt className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">Conservative</h3>
                      <p className="text-xs text-slate-400">Low risk, steady growth</p>
                    </div>
                    {riskProfile === 'conservative' && (
                      <FaCheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    )}
                  </div>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span>Money market funds (AAA rated)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span>FDIC-insured accounts only</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span>Manual approval required</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span>Focus on capital preservation</span>
                    </li>
                  </ul>
                </button>

                {/* Aggressive Option */}
                <button
                  onClick={() => setRiskProfile('aggressive')}
                  className={`text-left p-6 rounded-lg border-2 transition-all ${
                    riskProfile === 'aggressive'
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                      <FaRocket className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">Aggressive</h3>
                      <p className="text-xs text-slate-400">Higher risk, maximum returns</p>
                    </div>
                    {riskProfile === 'aggressive' && (
                      <FaCheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    )}
                  </div>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span>High-yield opportunities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span>DeFi protocols & staking</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span>Auto-execute when safe</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">•</span>
                      <span>Maximize yield potential</span>
                    </li>
                  </ul>
                </button>
              </div>

              {/* Risk Profile Info */}
              <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700">
                <div className="flex items-start gap-3">
                  <FaExclamationTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-slate-300">
                    <p className="font-medium text-white mb-1">Understanding Risk Profiles</p>
                    <p className="text-slate-400">
                      {riskProfile === 'conservative'
                        ? 'Conservative mode prioritizes safety and liquidity. Your funds will only be moved to FDIC-insured accounts and AAA-rated money market funds.'
                        : 'Aggressive mode seeks maximum returns. The AI will explore higher-yield opportunities including DeFi protocols, but only after thorough risk assessment.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alert Preferences Card */}
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FaBell className="w-5 h-5 text-emerald-500" />
                Alert Preferences
              </CardTitle>
              <CardDescription className="text-slate-400">
                Configure when you want to be notified about opportunities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Idle Money Threshold */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-white font-medium">Idle Money Alert Threshold</Label>
                  <span className="text-emerald-500 font-semibold">{idleThreshold}%</span>
                </div>
                <Slider
                  value={[idleThreshold]}
                  onValueChange={(value) => setIdleThreshold(value[0])}
                  min={5}
                  max={50}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-slate-400">
                  Alert me when {idleThreshold}% or more of my balance is idle for 7+ days
                </p>
              </div>

              <Separator className="bg-slate-700" />

              {/* Auto-Execute Toggle */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-white font-medium">Auto-Execute Low Risk Moves</Label>
                  <p className="text-xs text-slate-400">
                    Automatically sweep idle money into selected funds without confirmation
                  </p>
                </div>
                <Switch
                  checked={autoExecute}
                  onCheckedChange={setAutoExecute}
                />
              </div>

              <Separator className="bg-slate-700" />

              {/* Notification Types */}
              <div className="space-y-4">
                <Label className="text-white font-medium">Notification Types</Label>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FaDollarSign className="w-4 h-4 text-emerald-500" />
                      <div>
                        <p className="text-sm text-white">Idle Money Opportunities</p>
                        <p className="text-xs text-slate-400">When surplus cash is detected</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.idleMoney}
                      onCheckedChange={(checked) =>
                        setNotifications(prev => ({ ...prev, idleMoney: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FaBell className="w-4 h-4 text-purple-500" />
                      <div>
                        <p className="text-sm text-white">Subscription Alerts</p>
                        <p className="text-xs text-slate-400">Unused subscriptions detected</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.subscriptions}
                      onCheckedChange={(checked) =>
                        setNotifications(prev => ({ ...prev, subscriptions: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FaExclamationTriangle className="w-4 h-4 text-red-500" />
                      <div>
                        <p className="text-sm text-white">Anomaly Alerts</p>
                        <p className="text-xs text-slate-400">Duplicate charges & refund opportunities</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.anomalies}
                      onCheckedChange={(checked) =>
                        setNotifications(prev => ({ ...prev, anomalies: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FaChartLine className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="text-sm text-white">Weekly Financial Report</p>
                        <p className="text-xs text-slate-400">Summary of optimizations & savings</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications.weeklyReport}
                      onCheckedChange={(checked) =>
                        setNotifications(prev => ({ ...prev, weeklyReport: checked }))
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveSettings}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
            >
              <FaCheckCircle className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
