# Budget List - Quick Start Guide

## 🚀 Setup (One-Time)

### 1. Run Database Schema
Open Supabase SQL Editor and run:
```sql
-- Copy and paste contents of: supabase_budget_list_schema.sql
```

### 2. Restart App
The app should hot-reload automatically, or restart the dev server.

---

## 📱 How to Use

### Access Budget Lists
1. Open **Expenses** tab
2. Tap the **📋 list icon** in the top-right header
3. You'll see your budget lists (empty at first)

### Create Your First List
1. Tap the **+ button**
2. Fill in:
   - **Title**: "School Supplies 2024"
   - **Total Budget**: 400
   - **Purpose**: "Back to School"
   - **Recipient**: "Mom"
3. Tap **Create Budget List**

### Add Items
1. Open the list you just created
2. Tap the **+ button**
3. Add each item:
   - **Name**: "School Bag"
   - **Quantity**: 1
   - **Price**: 80
   - **Category**: Clothing
   - **Priority**: High
4. Tap **Add Item**
5. Repeat for all items

### Share the List
1. Open your budget list
2. Tap the **Share** button
3. Choose WhatsApp, SMS, or any messaging app
4. Send to your recipient!

---

## 📊 Example List

```
Title: School Supplies 2024
Budget: LRD 400.00
For: Mom

Items:
⭐ School Bag - 1 × LRD 80 = LRD 80
⭐ Uniform - 2 × LRD 50 = LRD 100
⭐ Shoes - 1 × LRD 60 = LRD 60
● Notebooks - 5 × LRD 10 = LRD 50
● Pens - 1 × LRD 30 = LRD 30

Total: LRD 320
Remaining: LRD 80
Status: ✅ Within Budget
```

---

## 🎯 Key Features

✅ **Multiple Lists** - Create as many as you need
✅ **Real-time Tracking** - See budget used vs. remaining
✅ **Color Alerts** - Green (good) → Yellow (warning) → Red (over)
✅ **Share Anywhere** - WhatsApp, SMS, Email, etc.
✅ **Mark Purchased** - Check off items as you buy them
✅ **Priorities** - High ⭐, Medium ⭐½, Low ☆
✅ **Categories** - Organize by type (Clothing, Books, etc.)

---

## 🔧 Troubleshooting

**Can't see the list icon?**
- Make sure the app reloaded after adding the files
- Check you're on the Expenses tab
- Look for the 📋 icon next to the filter icon

**Route warning in terminal?**
- This is normal during hot-reload
- The routes will work when you navigate to them
- Ignore the warning

**Database errors?**
- Make sure you ran `supabase_budget_list_schema.sql`
- Check tables exist: `budget_lists` and `budget_items`
- Verify you're logged in

---

## 📖 Full Documentation
See `BUDGET_LIST_SETUP.md` for complete details.
