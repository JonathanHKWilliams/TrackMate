# Budget List Feature - Setup Guide

## Overview
The **Budget List** feature allows users to create shopping lists with budget planning. Perfect for students requesting money from parents/sponsors, or anyone planning purchases with a fixed budget.

## Use Cases
- 📚 **Student Needs**: Create a list of school supplies (bag, uniform, shoes) with prices to send to parents
- 🛍️ **Shopping Planning**: Plan purchases within a budget and share with family
- 💰 **Budget Requests**: Make itemized lists with prices to request money from sponsors
- 📋 **Gift Planning**: Plan purchases for events with a set budget

## Features
✅ Create multiple budget lists with titles and descriptions
✅ Set total budget amount
✅ Add items with:
  - Name and description
  - Quantity and estimated price
  - Category (Clothing, Books, Electronics, etc.)
  - Priority (Low, Medium, High)
  - Notes
✅ Real-time budget tracking (spent vs. remaining)
✅ Visual progress bars with color alerts
✅ Mark items as purchased
✅ Share lists via text/messaging apps
✅ Track list status (Draft, Sent, Approved, Completed)
✅ Recipient field (who you're sending to)

## Database Setup

### Step 1: Run the Budget List Schema
Execute the SQL file in your Supabase SQL Editor:
```bash
supabase_budget_list_schema.sql
```

This creates:
- `budget_lists` table - stores budget list information
- `budget_items` table - stores individual items in lists
- RLS policies for data security
- Helper functions for calculations

### Step 2: Verify Tables
Check that these tables exist in your Supabase dashboard:
- `budget_lists`
- `budget_items`

## Application Integration

### Already Integrated ✅
The following have been added to your app:

1. **Context Provider** - `BudgetListProvider` added to `_layout.tsx`
2. **Budget List Service** - Full CRUD operations in `services/budgetListService.ts`
3. **TypeScript Types** - Budget list types in `types/budgetList.ts`
4. **UI Screens**:
   - `/budget-list` - Budget list overview screen
   - `/budget-list/new` - Create new budget list
   - `/budget-list/[id]` - Budget list detail with items
5. **Expenses Integration** - List icon button in expenses header

## Usage

### Creating a Budget List

1. **Navigate to Budget Lists**:
   - Go to Expenses tab
   - Tap the **list icon** (📋) in the top-right corner
   - Or navigate directly to `/budget-list`

2. **Create New List**:
   - Tap the **+ button**
   - Fill in:
     - **Title**: e.g., "School Supplies 2024"
     - **Description**: What the list is for
     - **Total Budget**: How much money you have (e.g., 400)
     - **Purpose**: e.g., "Back to School"
     - **Recipient**: Who you'll send it to (e.g., "Mom", "Sponsor")
   - Tap **Create Budget List**

### Adding Items to Your List

1. **Open the Budget List** you just created
2. **Tap the + button** to add items
3. **Fill in item details**:
   - **Item Name**: e.g., "School Bag"
   - **Description**: Additional details
   - **Quantity**: How many (default: 1)
   - **Price**: Estimated price per item
   - **Category**: Select from predefined categories
   - **Priority**: High (⭐), Medium (⭐½), Low (☆)
   - **Notes**: Any additional information
4. **Tap Add Item**

### Example: Student School Supplies List

```
Title: School Supplies for 2024
Budget: LRD 400.00
For: Mom

Items:
1. ⭐ School Bag
   Qty: 1 × LRD 80.00 = LRD 80.00
   Category: Clothing

2. ⭐ School Uniform
   Qty: 2 × LRD 50.00 = LRD 100.00
   Category: Clothing

3. ⭐ School Shoes
   Qty: 1 × LRD 60.00 = LRD 60.00
   Category: Clothing

4. ● Notebooks
   Qty: 5 × LRD 10.00 = LRD 50.00
   Category: Books & Supplies

5. ● Pens and Pencils
   Qty: 1 × LRD 30.00 = LRD 30.00
   Category: Books & Supplies

Total Estimated: LRD 320.00
Remaining Budget: LRD 80.00
```

### Sharing Your List

1. **Open the budget list**
2. **Tap the Share button**
3. **Choose how to share**:
   - WhatsApp
   - SMS/Text
   - Email
   - Any messaging app

The list will be formatted as text with all items, prices, and totals.

### Tracking Progress

**Visual Indicators**:
- 🟢 **Green** (0-79%): On track, within budget
- 🟡 **Yellow** (80-99%): Approaching budget limit
- 🔴 **Red** (100%+): Over budget

**Status Tracking**:
- **Draft**: Still working on the list
- **Sent**: Shared with recipient
- **Approved**: Recipient approved
- **Completed**: All items purchased

### Marking Items as Purchased

- Tap the **circle** next to an item to mark it as purchased
- Purchased items show with a checkmark ✓
- Track how many items you've bought

## API Functions

### Client Functions
```typescript
// Get all budget lists
const lists = await getBudgetLists(userId);

// Get budget list with all items
const list = await getBudgetListWithItems(listId);

// Create budget list
const list = await createBudgetList(userId, {
  title: 'School Supplies',
  total_budget: 400,
  purpose: 'Back to School',
  recipient: 'Mom',
});

// Add item to list
const item = await createBudgetItem({
  budget_list_id: listId,
  item_name: 'School Bag',
  quantity: 1,
  estimated_price: 80,
  category: 'Clothing',
  priority: 'high',
});

// Update item
await updateBudgetItem(itemId, { estimated_price: 85 });

// Delete item
await deleteBudgetItem(itemId);

// Mark item as purchased
await toggleItemPurchased(itemId, true);

// Share list
const text = formatBudgetListForSharing(list);
await Share.share({ message: text });
```

## Navigation

### Access Budget Lists
1. **From Expenses Screen**: 
   - Tap the list icon (📋) in the header
   
2. **Direct Navigation**:
   ```typescript
   router.push('/budget-list')
   router.push('/budget-list/new')
   router.push(`/budget-list/${listId}`)
   ```

## Budget Calculations

### Automatic Calculations
- **Total Estimated**: Sum of (quantity × price) for all items
- **Remaining Budget**: Total budget - Total estimated
- **Progress %**: (Total estimated / Total budget) × 100

### Over Budget Warning
If your items cost more than your budget, you'll see:
- Red progress bar
- Warning banner showing how much over
- Red text for remaining amount

## Categories

Available item categories:
- Clothing
- Books & Supplies
- Electronics
- Food & Groceries
- Transportation
- Health & Medicine
- Personal Care
- Entertainment
- Other

## Priority Levels

- **High (⭐)**: Must-have items, essential
- **Medium (⭐½)**: Important but not critical
- **Low (☆)**: Nice to have, optional

## Tips for Students

### Creating an Effective List

1. **Be Specific**: "Blue school bag with laptop compartment" instead of just "bag"
2. **Research Prices**: Check actual prices before adding items
3. **Prioritize**: Mark essential items as high priority
4. **Add Notes**: Explain why you need each item
5. **Stay Within Budget**: Adjust quantities or remove low-priority items if over budget

### Example Request to Parent/Sponsor

```
Hi Mom,

I've created a list of school supplies I need for the new semester. 
The total budget needed is LRD 400.00.

I've listed everything with estimated prices and marked the most 
important items. Please review the list and let me know if you 
have any questions.

[Share the list]

Thank you!
```

## Troubleshooting

### Lists Not Showing
1. Check database connection
2. Verify `budget_lists` table exists
3. Check RLS policies are enabled
4. Ensure user is authenticated

### Items Not Saving
1. Verify `budget_items` table exists
2. Check that budget list exists
3. Ensure all required fields are filled (name, price)
4. Check console for errors

### Share Not Working
1. Ensure device has sharing capabilities
2. Check app permissions
3. Try different sharing method

### Context Errors
Ensure `BudgetListProvider` wraps your app in `_layout.tsx`:
```typescript
<BudgetListProvider>
  <YourApp />
</BudgetListProvider>
```

## Differences from Expense Budget Feature

| Feature | Budget List | Expense Budget |
|---------|-------------|----------------|
| Purpose | Plan future purchases | Track past spending |
| Items | Estimated prices | Actual expenses |
| Use Case | Request money, shopping list | Monitor spending habits |
| Sharing | Yes, share lists | No |
| Status | Draft → Sent → Approved | Active/Inactive |
| Timeline | Before purchase | After purchase |

## Future Enhancements (Optional)
- [ ] PDF export for printing
- [ ] Image attachments for items
- [ ] Price comparison from online stores
- [ ] Budget list templates
- [ ] Collaborative lists (multiple users)
- [ ] Receipt upload after purchase
- [ ] Currency conversion
- [ ] Budget history and analytics

## Support
For issues or questions:
1. Check Supabase logs for database errors
2. Check console logs for client errors
3. Verify RLS policies for permission issues
4. Ensure all required fields are filled when creating lists/items
