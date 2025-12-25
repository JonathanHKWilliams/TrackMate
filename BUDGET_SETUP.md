# Budget Management Feature - Setup Guide

## Overview
The Budget Management feature allows users to create and track spending budgets with real-time progress monitoring, alerts, and category-specific tracking.

## Features
- ✅ Create budgets (weekly, monthly, yearly)
- ✅ Track spending against budgets in real-time
- ✅ Category-specific or overall budget tracking
- ✅ Visual progress bars with color-coded alerts
- ✅ Customizable alert thresholds (default 80%)
- ✅ Budget overview widget on expenses screen
- ✅ Automatic budget period calculations
- ✅ Budget alerts (threshold, exceeded, near end)

## Database Setup

### Step 1: Run the Budget Schema
Execute the SQL file in your Supabase SQL Editor:
```bash
supabase_budget_schema.sql
```

This creates:
- `budgets` table - stores budget information
- `budget_alerts` table - tracks alert history
- RLS policies for data security
- Helper functions for calculations

### Step 2: Verify Tables
Check that these tables exist in your Supabase dashboard:
- `budgets`
- `budget_alerts`

## Application Integration

### Already Integrated ✅
The following have been added to your app:

1. **Context Provider** - `BudgetProvider` added to `_layout.tsx`
2. **Budget Service** - Full CRUD operations in `services/budgetService.ts`
3. **TypeScript Types** - Budget types in `types/budget.ts`
4. **UI Screens**:
   - `/budget` - Budget list screen
   - `/budget/new` - Create budget screen
5. **Expenses Integration** - Budget overview widget on expenses screen

## Usage

### Creating a Budget
1. Navigate to Expenses screen
2. Scroll to "Active Budgets" section
3. Tap "Add Budget" or the + button
4. Fill in:
   - **Budget Name**: e.g., "Monthly Groceries"
   - **Amount**: Your budget limit
   - **Period**: Weekly, Monthly, or Yearly
   - **Category** (optional): Track specific category or all expenses
   - **Alert Threshold**: When to notify (default 80%)

### Viewing Budgets
- **Expenses Screen**: Horizontal scrollable cards showing active budgets
- **Budget Screen**: Full list with detailed progress and alerts

### Budget Alerts
Budgets show color-coded progress:
- 🟢 **Green** (0-79%): On track
- 🟡 **Yellow** (80-99%): Approaching limit
- 🔴 **Red** (100%+): Over budget

Alert types:
- **Threshold Alert**: Reached your alert percentage
- **Exceeded Alert**: Spent more than budget
- **Near End Alert**: Budget period ending soon with significant spending

### Budget Calculations
- **Spent**: Total expenses within budget period
- **Remaining**: Budget amount minus spent
- **Percentage**: (Spent / Budget) × 100

## API Functions

### Client Functions
```typescript
// Get all budgets
const budgets = await getBudgets(userId);

// Get active budgets with spending data
const activeBudgets = await getActiveBudgetsWithSpending(userId);

// Create budget
const budget = await createBudget(userId, {
  name: 'Monthly Food',
  amount: 500,
  period: 'monthly',
  category_id: categoryId, // optional
  start_date: '2024-01-01',
  end_date: '2024-01-31',
  alert_threshold: 80,
});

// Update budget
await updateBudget(budgetId, { amount: 600 });

// Delete budget
await deleteBudget(budgetId);

// Check for alerts
const alert = checkBudgetAlert(budgetWithSpending);
```

### Database Functions
```sql
-- Get budget spending
SELECT get_budget_spending(
  budget_id,
  start_date,
  end_date,
  category_id -- optional
);

-- Get active budgets with spending
SELECT * FROM get_active_budgets_with_spending(user_id);
```

## Navigation

### Access Budget Management
1. **From Expenses Screen**: 
   - Tap "View All" in Active Budgets section
   - Tap any budget card
   - Tap "Add Budget" button

2. **Direct Navigation**:
   ```typescript
   router.push('/budget')
   router.push('/budget/new')
   router.push(`/budget/${budgetId}`)
   ```

## Customization

### Adjust Alert Thresholds
Default is 80%, but users can set any value 0-100% when creating/editing budgets.

### Budget Periods
- **Weekly**: 7 days from start date
- **Monthly**: ~30 days (end of month)
- **Yearly**: 365 days from start date

### Color Scheme
Progress colors in `getProgressColor()`:
- Green: `#4ECDC4` (< 80%)
- Yellow: `#FFD93D` (80-99%)
- Red: `#FF4444` (≥ 100%)

## Troubleshooting

### Budgets Not Showing
1. Check database connection
2. Verify `budgets` table exists
3. Check RLS policies are enabled
4. Ensure user is authenticated

### Spending Not Updating
1. Verify expenses have correct `expense_date`
2. Check `category_id` matches if category-specific budget
3. Ensure budget dates cover expense dates
4. Refresh budget data: `refreshBudgets()`

### Context Errors
Ensure `BudgetProvider` wraps your app in `_layout.tsx`:
```typescript
<BudgetProvider>
  <YourApp />
</BudgetProvider>
```

## Future Enhancements (Optional)
- [ ] Budget templates
- [ ] Recurring budget auto-creation
- [ ] Budget sharing between users
- [ ] Budget analytics and insights
- [ ] Export budget reports
- [ ] Budget notifications (push)
- [ ] Budget rollover (carry unused to next period)
- [ ] Multi-currency budget support

## Support
For issues or questions, check:
1. Supabase logs for database errors
2. Console logs for client errors
3. RLS policies for permission issues
