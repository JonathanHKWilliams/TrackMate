# Navigation Structure Update

## Overview
The app navigation has been restructured to better organize financial features and separate different types of budget management.

## New Tab Structure

### Bottom Navigation Tabs (5 tabs)

1. **Tasks** 📋
   - Icon: checkbox
   - Manages tasks and to-dos
   - *No changes*

2. **Projects** 📁
   - Icon: folder
   - Manages projects
   - *No changes*

3. **Notes** 📝
   - Icon: document-text
   - Manages notes with locking
   - *No changes*

4. **Finance** 🏦 *(NEW - replaces Expenses)*
   - Icon: grid
   - **Hub screen** with two sub-features:
     - **Expenses** - Track spending (actual expenses)
     - **Budget Lists** - Plan purchases (shopping lists)

5. **Budgets** 📊 *(NEW - separate tab)*
   - Icon: pie-chart
   - Track spending against budget limits
   - Monitor budget progress
   - Set budget alerts

6. **Settings** ⚙️
   - Icon: settings
   - App settings and preferences
   - *No changes*

---

## Feature Organization

### Finance Hub (Tab 4)
**Purpose**: Central hub for money-related features

**Sub-Features**:

#### 1. Expenses
- **Route**: `/expense-hub`
- **What it does**: Track money you've already spent
- **Features**:
  - Add/edit/delete expenses
  - Categorize spending
  - Search and filter
  - View spending analytics
  - Track by merchant, tags, dates

#### 2. Budget Lists
- **Route**: `/budget-list`
- **What it does**: Plan future purchases with a fixed budget
- **Features**:
  - Create shopping lists with budget limits
  - Add items with estimated prices
  - Track budget vs. spending
  - Share lists (WhatsApp, SMS, etc.)
  - Mark items as purchased
  - Perfect for students requesting money

**Navigation Flow**:
```
Finance Tab → Finance Hub Screen
  ├─→ Tap "Expenses" → Expense Hub → View/Add Expenses
  └─→ Tap "Budget Lists" → Budget Lists → Create/View Lists
```

---

### Budgets (Tab 5 - Standalone)
**Purpose**: Monitor spending against budget limits

**What it does**: 
- Set budget limits for time periods (weekly, monthly, yearly)
- Track actual spending from expenses
- Get alerts when approaching limits
- Monitor by category or overall spending

**Features**:
- Create budgets with amount and period
- Real-time spending tracking
- Color-coded progress (green → yellow → red)
- Budget alerts (80%, 100%, exceeded)
- Category-specific or overall budgets

**Navigation Flow**:
```
Budgets Tab → Budget List Screen
  └─→ Tap Budget → Budget Detail → View Progress
  └─→ Tap + → Create New Budget
```

---

## Key Differences

### Finance Hub vs. Budgets Tab

| Feature | Finance Hub | Budgets Tab |
|---------|-------------|-------------|
| **Purpose** | Access point for money features | Track spending limits |
| **Type** | Hub/Dashboard | Feature screen |
| **Contains** | Expenses + Budget Lists | Budget tracking only |
| **Use Case** | "I want to manage money" | "I want to track my budget" |

### Expenses vs. Budget Lists

| Feature | Expenses | Budget Lists |
|---------|----------|--------------|
| **When** | After spending | Before spending |
| **Purpose** | Record what you spent | Plan what to spend |
| **Data** | Actual amounts | Estimated prices |
| **Sharing** | No | Yes (WhatsApp, SMS) |
| **Items** | Single transactions | Multiple items per list |
| **Use Case** | "I bought groceries for $50" | "I need $400 for school supplies" |

### Budget Lists vs. Budgets

| Feature | Budget Lists | Budgets |
|---------|--------------|---------|
| **Purpose** | Shopping list with budget | Spending limit tracker |
| **Items** | List of things to buy | Tracks all expenses |
| **Sharing** | Yes | No |
| **Status** | Draft → Sent → Approved | Active/Inactive |
| **Use Case** | "Send list to mom" | "Don't spend over $500/month" |

---

## User Scenarios

### Scenario 1: Student Needs School Supplies
1. Go to **Finance** tab
2. Tap **Budget Lists**
3. Create new list: "School Supplies"
4. Add items: Bag ($80), Uniform ($100), Shoes ($60)
5. Share list with parent via WhatsApp
6. Parent approves and sends money
7. Buy items and mark as purchased

### Scenario 2: Track Monthly Spending
1. Go to **Budgets** tab
2. Create budget: "Monthly Expenses - $500"
3. As you spend, add expenses in **Finance → Expenses**
4. Budget automatically tracks spending
5. Get alerts at 80% and 100%

### Scenario 3: Record Daily Expenses
1. Go to **Finance** tab
2. Tap **Expenses**
3. Tap + to add new expense
4. Fill in amount, category, merchant
5. View in expense list

---

## Migration Notes

### What Changed
- **Old**: Expenses was a tab
- **New**: Finance is a tab (hub), Expenses is inside it

### What's New
- Finance hub screen (landing page)
- Budget Lists feature (shopping lists)
- Budgets tab (separate from expenses)

### What Stayed the Same
- All expense functionality intact
- Expense tracking still works
- Categories, tags, merchants unchanged

---

## File Structure

```
app/
├── (tabs)/
│   ├── index.tsx          # Tasks (unchanged)
│   ├── projects.tsx       # Projects (unchanged)
│   ├── notes.tsx          # Notes (unchanged)
│   ├── finance.tsx        # NEW: Finance Hub
│   ├── budgets.tsx        # NEW: Budgets Tab
│   ├── settings.tsx       # Settings (unchanged)
│   ├── expenses.tsx       # Hidden (kept for compatibility)
│   └── history.tsx        # Hidden
├── expense-hub/
│   └── index.tsx          # NEW: Expenses screen (moved)
├── budget-list/
│   ├── index.tsx          # Budget Lists overview
│   ├── new.tsx            # Create budget list
│   └── [id].tsx           # Budget list detail
└── budget/
    ├── index.tsx          # Budgets overview
    ├── new.tsx            # Create budget
    └── [id].tsx           # Budget detail
```

---

## Quick Reference

### Access Expenses
**Old**: Expenses tab → Expenses screen
**New**: Finance tab → Tap "Expenses" → Expenses screen

### Access Budget Lists
**New**: Finance tab → Tap "Budget Lists" → Budget Lists screen

### Access Budgets (Spending Tracker)
**New**: Budgets tab → Budgets screen

---

## Benefits of New Structure

1. **Clearer Organization**: Finance hub groups related money features
2. **Separate Concerns**: Budget tracking separate from budget planning
3. **Scalable**: Easy to add more financial features to hub
4. **User-Friendly**: Clear distinction between planning and tracking
5. **Feature Discovery**: Hub screen helps users find features

---

## Next Steps

1. Run the app and test navigation
2. Verify all routes work correctly
3. Test Finance hub → Expenses flow
4. Test Finance hub → Budget Lists flow
5. Test Budgets tab functionality
6. Update any hardcoded navigation references

---

## Support

If you encounter navigation issues:
1. Check the Finance tab shows the hub screen
2. Verify Expenses opens from Finance hub
3. Verify Budget Lists opens from Finance hub
4. Verify Budgets tab shows budget tracking
5. Check console for routing errors
