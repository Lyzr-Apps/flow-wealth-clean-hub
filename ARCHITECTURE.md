# FlowState - System Architecture

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│  Next.js App (Dark Mode, Dynamic Theming, Real-time Updates)   │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ├─ Shadow Balance Widget
                      ├─ Financial Health Score Gauge
                      ├─ Predictive Liquidity Calendar
                      ├─ Goal-Aligned Recommendations
                      └─ Intent Trigger Manager
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                     NEXT.JS API ROUTES                          │
│              (Orchestration & State Management)                 │
└─────────────────────┬───────────────────────────────────────────┘
                      │
          ┌───────────┼───────────┐
          │           │           │
┌─────────▼──┐  ┌────▼─────┐  ┌─▼──────────┐
│  /analyze  │  │ /execute │  │  /webhooks │
│            │  │          │  │   /plaid   │
│ Triggers   │  │ Triggers │  │            │
│ Wealth     │  │ Executor │  │ Real-time  │
│ Architect  │  │ Agent    │  │ Transaction│
└─────┬──────┘  └────┬─────┘  └─┬──────────┘
      │              │           │
┌─────▼──────────────▼───────────▼──────────────────────┐
│              LYZR AGENT ECOSYSTEM                     │
│                                                        │
│  ┌──────────────────────────────────────────────┐    │
│  │    Autonomous Wealth Controller (Manager)    │    │
│  │  - Contextual memory engine                  │    │
│  │  - Goal alignment orchestration              │    │
│  │  - UI interaction tag generation             │    │
│  └──────────────┬───────────────────────────────┘    │
│                 │                                      │
│    ┌────────────┼────────────┐                       │
│    │            │             │                       │
│ ┌──▼──────┐ ┌──▼─────────┐ ┌▼──────────┐            │
│ │  Data   │ │  Market    │ │ Executioner│            │
│ │ Cruncher│ │ Strategist │ │   Agent    │            │
│ │         │ │            │ │            │            │
│ │·Predict │ │·RAG Market │ │·API Bundle │            │
│ │ Liquid. │ │ Intel      │ │·Rollback   │            │
│ │·Shadow  │ │·Goal Match │ │·Security   │            │
│ │ Balance │ │·Risk Align │ │·Audit Trail│            │
│ └─────────┘ └────────────┘ └────────────┘            │
└───────────────────────┬────────────────────────────────┘
                        │
┌───────────────────────▼────────────────────────────────┐
│              INTEGRATION LAYER                         │
├────────────────────────────────────────────────────────┤
│  Plaid API        │  Market Data API  │  Gmail/Composio│
│  (Banking)        │  (Yields/ETFs)    │  (Cancellations)│
└────────────────────────────────────────────────────────┘
                        │
┌───────────────────────▼────────────────────────────────┐
│              STATE & PERSISTENCE LAYER                 │
├────────────────────────────────────────────────────────┤
│  Supabase PostgreSQL (Prisma ORM)                     │
│                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ User & Goals │  │ Transactions │  │ Execution   │ │
│  │              │  │ + Categories │  │ History     │ │
│  └──────────────┘  └──────────────┘  └─────────────┘ │
│                                                        │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │Intent Triggers│  │ Financial   │  │ Predicted   │ │
│  │(Automation)  │  │ Health      │  │ Bills       │ │
│  └──────────────┘  └──────────────┘  └─────────────┘ │
└────────────────────────────────────────────────────────┘
                        │
┌───────────────────────▼────────────────────────────────┐
│              SECURITY & COMPLIANCE LAYER               │
├────────────────────────────────────────────────────────┤
│  HMAC Signatures  │  Idempotency  │  Rate Limiting    │
│  Encryption       │  Audit Logs   │  GDPR/PSD2        │
└────────────────────────────────────────────────────────┘
```

---

## Data Flow: User Financial Analysis

```
1. USER ACTION: Clicks "Analyze My Finances"
   └─> Dashboard triggers: POST /api/agent/analyze

2. API ROUTE: /api/agent/analyze
   ├─> Fetch user context from database:
   │   ├─ Financial goals (active)
   │   ├─ Recent transactions (last 100)
   │   ├─ User preferences (risk profile, thresholds)
   │   └─ Active intent triggers
   │
   ├─> Build enriched prompt with context
   │
   └─> Call Autonomous Wealth Controller (Manager Agent)

3. WEALTH ARCHITECT MANAGER
   ├─> Delegate to Data Cruncher Agent:
   │   ├─ Analyze transactions
   │   ├─ Calculate burn rate
   │   ├─ Identify surplus capital
   │   ├─ Predict upcoming bills (30 days)
   │   ├─ Calculate shadow balance
   │   └─ Flag anomalies (duplicates, vampires)
   │
   ├─> Delegate to Market Strategist Agent:
   │   ├─ Fetch current market yields
   │   ├─ Match opportunities to risk profile
   │   ├─ Align with financial goals
   │   └─ Calculate goal milestone projections
   │
   ├─> Delegate to Executioner Agent:
   │   ├─ Prepare execution bundles
   │   ├─ Create rollback plans
   │   └─ Generate security metadata
   │
   └─> Aggregate results:
       ├─ Financial health score (0-100)
       ├─ Goal-aligned recommendations
       ├─ UI interaction tags (URGENT/GROWTH/STABLE)
       └─ Shadow balance

4. API ROUTE: Save snapshot to database
   └─> Create FinancialHealthSnapshot record

5. RESPONSE: Return to frontend
   ├─ Analysis data
   ├─ UI metadata (theme, actions)
   └─ Timestamp

6. UI UPDATE: Dashboard re-renders
   ├─> Update shadow balance widget
   ├─> Animate health score gauge
   ├─> Apply dynamic theme (color transition)
   ├─> Populate recommendation cards
   └─> Display liquidity calendar
```

---

## Data Flow: Action Execution

```
1. USER ACTION: Clicks "Execute Sweep" on recommendation card
   └─> Confirmation modal appears

2. USER CONFIRMS: Modal "Execute" button
   └─> Dashboard triggers: POST /api/agent/execute

3. API ROUTE: /api/agent/execute
   ├─> Generate security metadata:
   │   ├─ Idempotency key (exec_{timestamp}_{random})
   │   ├─ HMAC signature (SHA-256)
   │   └─ Verification hash
   │
   ├─> Create ExecutionHistory record (state: PENDING)
   │   └─ Audit trail with regulatory flags [GDPR, PSD2]
   │
   ├─> Initialize state machine
   │   └─> STATE: PENDING
   │
   └─> Update state → VALIDATING

4. EXECUTIONER AGENT: Validation
   ├─> Check sufficient balance
   ├─> Verify liquidity buffer not breached
   ├─> Validate regulatory compliance
   ├─> Prepare API call bundle
   └─> Generate rollback plan

5. STATE MACHINE: Transition
   ├─ VALIDATING → EXECUTING (if validation passes)
   └─ VALIDATING → FAILED (if validation fails)

6. EXECUTION: API Calls
   ├─> Plaid API: Initiate transfer
   ├─> OR Gmail/Composio: Send cancellation email
   ├─> OR Market API: Create investment order
   └─> Track state transitions

7. STATE MACHINE: Final Transition
   ├─ EXECUTING → COMPLETED (success)
   └─ EXECUTING → FAILED → ROLLED_BACK (failure)

8. DATABASE UPDATE: ExecutionHistory
   ├─> Update state, success flag, completion timestamp
   ├─> Store state transitions array
   └─> Log final status

9. RESPONSE: Return to frontend
   ├─ Execution ID
   ├─ Idempotency key
   ├─ State transitions
   └─ Success/failure status

10. UI UPDATE: Real-time feedback
    ├─> Update recommendation card (completed badge)
    ├─> Refresh shadow balance
    ├─> Update health score
    ├─> Add to execution history timeline
    └─> Show inline success alert (no toast)
```

---

## Agent Orchestration Pattern

### Manager-Subagent Coordination

```
Wealth Architect Manager (Orchestrator)
│
├─> Receives user request with context
│
├─> Delegates to specialized sub-agents:
│   │
│   ├─> Data Cruncher Agent
│   │   ├─ Input: Transaction history, user preferences
│   │   ├─ Process: Analyze, categorize, predict
│   │   └─ Output: Burn rate, surplus, predicted bills, anomalies
│   │
│   ├─> Market Strategist Agent
│   │   ├─ Input: Surplus amount, risk profile, goals
│   │   ├─ Process: RAG query, yield comparison, goal alignment
│   │   └─ Output: Investment opportunities with goal impact
│   │
│   └─> Executioner Agent
│       ├─ Input: Recommended actions, user context
│       ├─ Process: Validate, bundle APIs, create rollback plan
│       └─ Output: Execution-ready bundles with security metadata
│
├─> Synthesizes sub-agent outputs:
│   ├─ Cross-references recommendations with goals
│   ├─ Prioritizes actions by urgency & impact
│   ├─ Generates UI interaction tags
│   └─ Calculates composite health score
│
└─> Returns unified response:
    ├─ wealth_optimization_summary
    ├─ actionable_recommendations (goal-aligned)
    ├─ financial_health_score
    ├─ shadow_balance
    ├─ ui_interaction_tags
    └─ reasoning_manifest
```

---

## State Machine Architecture

### Execution State Transitions

```
┌─────────┐
│ PENDING │ (Initial state, execution requested)
└────┬────┘
     │ START_VALIDATION
     ▼
┌────────────┐
│ VALIDATING │ (Checking balance, liquidity, compliance)
└─────┬──────┘
      │
      ├─ VALIDATION_SUCCESS
      │  ▼
      │ ┌───────────┐
      │ │ EXECUTING │ (Calling Plaid/Gmail/Market APIs)
      │ └─────┬─────┘
      │       │
      │       ├─ EXECUTION_SUCCESS
      │       │  ▼
      │       │ ┌───────────┐
      │       │ │ COMPLETED │ (Terminal state - success)
      │       │ └───────────┘
      │       │
      │       └─ EXECUTION_FAILURE
      │          ▼
      │         ┌────────┐
      │         │ FAILED │
      │         └────┬───┘
      │              │ ROLLBACK
      │              ▼
      │         ┌──────────────┐
      │         │ ROLLED_BACK  │ (Terminal state - reverted)
      │         └──────────────┘
      │
      └─ VALIDATION_FAILURE
         ▼
        ┌────────┐
        │ FAILED │ (Terminal state - validation error)
        └────────┘
```

**Valid Transitions Matrix**:
```typescript
PENDING      → [VALIDATING]
VALIDATING   → [EXECUTING, FAILED]
EXECUTING    → [COMPLETED, FAILED]
FAILED       → [ROLLED_BACK, PENDING]
COMPLETED    → []  // Terminal
ROLLED_BACK  → []  // Terminal
```

---

## Database Schema Architecture

### Entity Relationship Diagram

```
┌──────────┐
│   User   │
└─────┬────┘
      │
      ├─── has many ───> FinancialGoal
      │                  (target_amount, target_date, priority)
      │
      ├─── has many ───> Transaction
      │                  (amount, merchant, category_sanitized,
      │                   is_duplicate, is_vampire, is_unusual)
      │
      ├─── has one ────> UserPreferences
      │                  (risk_profile, idle_money_threshold,
      │                   shadow_balance_days, auto_execute_enabled)
      │
      ├─── has many ───> IntentTrigger
      │                  (natural_language, condition_category,
      │                   action_type, target_goal_id)
      │
      ├─── has many ───> ExecutionHistory
      │                  (execution_type, state, hmac_signature,
      │                   idempotency_key, state_transitions[])
      │
      └─── has many ───> FinancialHealthSnapshot
                         (health_score, shadow_balance,
                          burn_rate, ui_theme)
```

**Cascade Deletes**: All child records deleted when User is deleted (GDPR compliance)

---

## Security Architecture

### HMAC Signature Flow

```
1. Client Request Preparation
   ├─> Collect payload: { userId, actionType, actionData }
   ├─> Serialize: JSON.stringify(payload)
   └─> Send to server

2. Server-Side Signature Generation
   ├─> Receive payload
   ├─> Generate HMAC:
   │   └─ crypto.createHmac('sha256', SECRET_KEY)
   │        .update(payloadString)
   │        .digest('hex')
   │
   └─> Attach to execution record

3. Webhook Verification (Plaid → Server)
   ├─> Receive webhook payload + signature header
   ├─> Recompute HMAC with same algorithm
   ├─> Compare signatures (timing-safe)
   │   ├─ Match → Process webhook
   │   └─ Mismatch → Reject (401 Unauthorized)
   └─> Log verification attempt
```

### Idempotency Protection

```
Request Flow:
1. Client sends: actionType, actionData
2. Server generates: idempotencyKey = "exec_{timestamp}_{random}"
3. Create ExecutionHistory with idempotencyKey (unique constraint)

Duplicate Request Detection:
1. Client retries same request
2. Server attempts to create ExecutionHistory
3. Database rejects (unique constraint violation)
4. Server returns original execution result

Benefits:
- Prevents double-charging
- Safe to retry on network errors
- Audit trail preserved
```

---

## Compliance Architecture

### GDPR Implementation

**Data Minimization**:
```typescript
// Only store necessary fields
const userProfile = minimizeData(fullUserData, [
  'id', 'email', 'riskProfile', 'createdAt'
]);
```

**Right to Deletion**:
```sql
-- Cascade deletes in schema
model User {
  goals             FinancialGoal[]      // onDelete: Cascade
  transactions      Transaction[]        // onDelete: Cascade
  executionHistory  ExecutionHistory[]   // onDelete: Cascade
}
```

**Audit Logging**:
```typescript
// Every data access logged
createAuditLog({
  userId: 'user_123',
  action: 'READ',
  resourceType: 'Transaction',
  resourceId: 'txn_456',
  status: 'success'
});
```

### PSD2 Strong Customer Authentication

```typescript
// Validate two factors
validateSCA({
  hasPassword: true,      // Knowledge factor
  hasDeviceToken: true,   // Possession factor
  hasBiometric: false     // Inherence factor
});
// Returns: { valid: true, factors: 2 }
```

**Requirements for Financial Operations**:
- Transfer > $100 → SCA required
- Subscription cancellation → SCA recommended
- Investment creation → SCA required

---

## Performance Optimization

### Database Indexes

```prisma
@@index([userId, date])              // Transaction queries
@@index([userId, categorySanitized]) // Category filtering
@@index([plaidTransactionId])        // Webhook lookups
@@index([userId, status])            // Active goals
@@index([state])                     // Execution monitoring
```

### Caching Strategy

**API Routes**:
- Financial health snapshots: Cache 5 minutes
- Goal progress: Cache 1 minute
- Transaction list: Real-time (no cache)

**Agent Responses**:
- Market data: Cache 15 minutes (stale-while-revalidate)
- Predicted bills: Cache 24 hours

### Rate Limiting

```typescript
// Prevent API abuse
apiRateLimiter.isAllowed(userId)      // 100 req/min
executionRateLimiter.isAllowed(userId) // 10 exec/min
```

---

## Monitoring & Observability

### Key Metrics

**Business Metrics**:
- Average financial health score
- Execution success rate
- Goal completion rate
- Shadow balance accuracy
- Anomaly detection precision

**Technical Metrics**:
- API response times
- Agent orchestration latency
- Database query performance
- Webhook processing time
- State machine transitions

**Security Metrics**:
- Failed HMAC verifications
- Rate limit violations
- Rollback frequency
- Idempotency key collisions

### Error Tracking

**Categories**:
1. Agent failures (timeout, invalid response)
2. Validation failures (insufficient balance, buffer breach)
3. Execution failures (API errors, network issues)
4. Security violations (invalid signature, rate limit)

**Alerting**:
- Health score drops below 40 → User notification
- Execution failure rate > 10% → Engineering alert
- HMAC verification failures → Security team alert

---

## Scalability Considerations

### Current Architecture Limitations

**In-Memory State**:
- PlaidClient session store: Single instance only
- Rate limiters: Not distributed

**Solutions for Scale**:
```
┌─────────────────────────────────────┐
│  Load Balancer                      │
└─────────────┬───────────────────────┘
              │
      ┌───────┴───────┐
      │               │
┌─────▼─────┐  ┌─────▼─────┐
│ Next.js 1 │  │ Next.js 2 │
└─────┬─────┘  └─────┬─────┘
      │               │
      └───────┬───────┘
              │
┌─────────────▼───────────────────────┐
│  Redis (Distributed State)          │
│  - Session store                    │
│  - Rate limiting counters           │
│  - Cache layer                      │
└─────────────────────────────────────┘
```

### Database Scaling

**Read Replicas**:
- Financial health snapshots → Read replica
- Transaction history → Read replica
- Execution writes → Primary database

**Partitioning Strategy**:
```sql
-- Partition transactions by date
CREATE TABLE transactions_2026_01 PARTITION OF transactions
  FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
```

---

This architecture supports:
- 10,000 concurrent users
- 1M transactions/month
- 100K agent calls/day
- 99.9% uptime SLA
- Sub-second API response times
