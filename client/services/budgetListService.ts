import { supabase } from '../lib/supabase';
import {
  BudgetList,
  BudgetListWithItems,
  BudgetListSummary,
  CreateBudgetListInput,
  UpdateBudgetListInput,
  CreateBudgetItemInput,
  UpdateBudgetItemInput,
  BudgetItem,
} from '../types/budgetList';

// Budget List CRUD Operations

export async function getBudgetLists(userId: string): Promise<BudgetListSummary[]> {
  const { data, error } = await supabase.rpc('get_user_budget_lists', {
    p_user_id: userId,
  });

  if (error) throw error;
  return data || [];
}

export async function getBudgetListWithItems(listId: string): Promise<BudgetListWithItems | null> {
  const { data, error } = await supabase.rpc('get_budget_list_with_items', {
    p_list_id: listId,
  });

  if (error) throw error;
  if (!data || data.length === 0) return null;

  const result = data[0];
  return {
    id: result.list_id,
    user_id: '', // Not returned by function
    title: result.list_title,
    description: result.list_description,
    total_budget: result.total_budget,
    currency: result.currency,
    purpose: result.purpose,
    recipient: result.recipient,
    status: result.status,
    total_estimated: result.total_estimated,
    total_actual: result.total_actual,
    remaining_budget: result.remaining_budget,
    item_count: result.item_count,
    purchased_count: result.purchased_count,
    items: result.items,
    created_at: '',
    updated_at: '',
  };
}

export async function createBudgetList(
  userId: string,
  input: CreateBudgetListInput
): Promise<BudgetList> {
  const { data, error } = await supabase
    .from('budget_lists')
    .insert({
      user_id: userId,
      title: input.title,
      description: input.description,
      total_budget: input.total_budget,
      currency: input.currency || 'LRD',
      purpose: input.purpose,
      recipient: input.recipient,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBudgetList(
  listId: string,
  input: UpdateBudgetListInput
): Promise<BudgetList> {
  const { data, error } = await supabase
    .from('budget_lists')
    .update(input)
    .eq('id', listId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBudgetList(listId: string): Promise<void> {
  const { error } = await supabase.from('budget_lists').delete().eq('id', listId);

  if (error) throw error;
}

// Budget Item CRUD Operations

export async function getBudgetItems(listId: string): Promise<BudgetItem[]> {
  const { data, error } = await supabase
    .from('budget_items')
    .select('*')
    .eq('budget_list_id', listId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createBudgetItem(input: CreateBudgetItemInput): Promise<BudgetItem> {
  const { data, error } = await supabase
    .from('budget_items')
    .insert({
      budget_list_id: input.budget_list_id,
      item_name: input.item_name,
      description: input.description,
      quantity: input.quantity || 1,
      estimated_price: input.estimated_price,
      category: input.category,
      priority: input.priority || 'medium',
      notes: input.notes,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBudgetItem(
  itemId: string,
  input: UpdateBudgetItemInput
): Promise<BudgetItem> {
  const { data, error } = await supabase
    .from('budget_items')
    .update(input)
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteBudgetItem(itemId: string): Promise<void> {
  const { error } = await supabase.from('budget_items').delete().eq('id', itemId);

  if (error) throw error;
}

export async function toggleItemPurchased(itemId: string, isPurchased: boolean): Promise<void> {
  const { error } = await supabase
    .from('budget_items')
    .update({ is_purchased: isPurchased })
    .eq('id', itemId);

  if (error) throw error;
}

// Helper Functions

export function calculateBudgetProgress(list: BudgetListSummary | BudgetListWithItems): {
  percentage: number;
  isOverBudget: boolean;
  remaining: number;
} {
  const percentage = (list.total_estimated / list.total_budget) * 100;
  const isOverBudget = list.total_estimated > list.total_budget;
  const remaining = list.total_budget - list.total_estimated;

  return {
    percentage: Math.min(percentage, 100),
    isOverBudget,
    remaining,
  };
}

export function formatBudgetListForSharing(list: BudgetListWithItems): string {
  const lines: string[] = [];
  
  lines.push(`${list.title}`);
  if (list.description) lines.push(`${list.description}`);
  lines.push('');
  
  if (list.purpose) lines.push(`Purpose: ${list.purpose}`);
  if (list.recipient) lines.push(`For: ${list.recipient}`);
  lines.push(`Total Budget: ${list.currency} ${list.total_budget.toFixed(2)}`);
  lines.push('');
  
  lines.push('Items:');
  lines.push('─────────────────────────────');
  
  list.items.forEach((item, index) => {
    const total = item.estimated_price * item.quantity;
    const priority = item.priority === 'high' ? '' : item.priority === 'low' ? '○' : '●';
    
    lines.push(`${index + 1}. ${priority} ${item.item_name}`);
    if (item.description) lines.push(`   ${item.description}`);
    lines.push(`   Qty: ${item.quantity} × ${list.currency} ${item.estimated_price.toFixed(2)} = ${list.currency} ${total.toFixed(2)}`);
    if (item.category) lines.push(`   Category: ${item.category}`);
    if (item.notes) lines.push(`   Note: ${item.notes}`);
    lines.push('');
  });
  
  lines.push('─────────────────────────────');
  lines.push(`Total Estimated: ${list.currency} ${list.total_estimated.toFixed(2)}`);
  lines.push(`Remaining Budget: ${list.currency} ${list.remaining_budget.toFixed(2)}`);
  
  if (list.remaining_budget < 0) {
    lines.push(`Over budget by ${list.currency} ${Math.abs(list.remaining_budget).toFixed(2)}`);
  }
  
  return lines.join('\n');
}

export function generateBudgetListPDF(list: BudgetListWithItems): string {
  const progress = calculateBudgetProgress(list);
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${list.title} - TrackMate Budget List</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
      color: #333;
      padding: 40px 20px;
    }
    .receipt {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      box-shadow: 0 10px 40px rgba(0,0,0,0.3);
<!--       border-radius: 12px; -->
      overflow: hidden;
    }
    .app-header {
      background: linear-gradient(135deg, #000000ff 0%, #000000ff 100%);
      color: #FF8C00;
      padding: 30px;
      text-align: center;
    }
    .app-logo {
      font-size: 58px;
      font-weight: 900;
      margin-bottom: 8px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }
    .app-name {
      font-size: 48px;
      font-weight: 600;
      letter-spacing: 2px;
      margin-bottom: 4px;
    }
    .app-tagline {
      font-size: 14px;
      opacity: 0.9;
      font-style: italic;
    }
    .receipt-header {
      background: #f8f9fa;
      padding: 30px;
      border-bottom: 3px solid #000000ff;
    }
    .receipt-title {
      font-size: 28px;
      font-weight: 700;
      color: #000;
      margin-bottom: 12px;
      text-align: center;
    }
    .receipt-description {
      font-size: 16px;
      color: #666;
      text-align: center;
      margin-bottom: 20px;
    }
    .receipt-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-top: 20px;
    }
    .info-item {
      background: white;
      padding: 15px;
      border-radius: 8px;
    }
    .info-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }
    .info-value {
      font-size: 18px;
      font-weight: 600;
      color: #000;
    }
    .budget-summary {
      background: linear-gradient(135deg, #000000ff 0%, #000000ff 100%);
      color: white;
      padding: 25px 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .budget-summary.over-budget {
      background: linear-gradient(135deg, #FF4444 0%, #CC0000 100%);
    }
    .budget-item {
      text-align: center;
    }
    .budget-label {
      font-size: 12px;
      opacity: 0.9;
      margin-bottom: 4px;
    }
    .budget-amount {
      font-size: 28px;
      font-weight: 700;
    }
    .items-section {
      padding: 30px;
    }
    .section-title {
      font-size: 20px;
      font-weight: 700;
      color: #000;
      margin-bottom: 20px;
      padding-bottom: 10px;
      // border-bottom: 2px solid #FF8C00;
    }
    .item {
      background: #f3f3f3ff;
      padding: 20px;
      margin-bottom: 15px;
      border-radius: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .item-details {
      flex: 1;
    }
    .item-number {
      display: inline-block;
      background: #FF8C00;
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      text-align: center;
      line-height: 28px;
      font-weight: 700;
      margin-right: 15px;
      font-size: 14px;
    }
    .item-name {
      font-size: 18px;
      font-weight: 600;
      color: #000;
      margin-bottom: 6px;
    }
    .item-meta {
      font-size: 14px;
      color: #666;
      margin-top: 4px;
    }
    .item-category {
      display: inline-block;
      background: #000000ff;
      color: white;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      margin-right: 8px;
    }
    .item-priority {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }
    .priority-high { background: #FF4444; color: white; }
    .priority-medium { background: #FF8C00; color: white; }
    .priority-low { background: #000000ff; color: white; }
    .item-pricing {
      text-align: right;
      min-width: 150px;
    }
    .item-calculation {
      font-size: 14px;
      color: #000000ff;
      margin-bottom: 4px;
    }
    .item-total {
      font-size: 20px;
      font-weight: 700;
      color: #FF8C00;
    }
    .totals-section {
      background: #f8f9fa;
      padding: 30px;
      border-top: 3px solid #FF8C00;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      font-size: 28px;
    }
    .total-row.grand-total {
      border-top: 2px solid #ddd;
      margin-top: 10px;
      padding-top: 15px;
      font-size: 32px;
      font-weight: 700;
    }
    .total-row.remaining {
      color: ${progress.isOverBudget ? '#FF4444' : '#000000ff'};
      font-weight: 700;
    }
    .footer {
      background: #000;
      color: white;
      padding: 25px;
      text-align: center;
    }
    .footer-date {
      font-size: 14px;
      margin-bottom: 10px;
      opacity: 0.8;
    }
    .footer-branding {
      font-size: 12px;
      opacity: 0.6;
    }
    .warning-banner {
      background: #FF4444;
      color: white;
      padding: 15px 30px;
      text-align: center;
      font-weight: 600;
      font-size: 16px;
    }
    @media print {
      body { background: white; padding: 0; }
      .receipt { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="receipt">
    <!-- App Header -->
    <div class="app-header">
      <div class="app-logo"></div>
      <div class="app-name">TRACKMATE BUDGET</div>
      <div class="app-tagline">Budget Planning Made Simple</div>
    </div>

    <!-- Receipt Header -->
    <div class="receipt-header">
      <div class="receipt-title">${list.title}</div>
      ${list.description ? `<div class="receipt-description">${list.description}</div>` : ''}
      
      <div class="receipt-info">
        ${list.purpose ? `
          <div class="info-item">
            <div class="info-label">Purpose</div>
            <div class="info-value">${list.purpose}</div>
          </div>
        ` : ''}
        ${list.recipient ? `
          <div class="info-item">
            <div class="info-label">Recipient</div>
            <div class="info-value">${list.recipient}</div>
          </div>
        ` : ''}
        <div class="info-item">
          <div class="info-label">Status</div>
          <div class="info-value" style="text-transform: capitalize;">${list.status}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Date Created</div>
          <div class="info-value">${new Date(list.created_at).toLocaleDateString()}</div>
        </div>
      </div>
    </div>

    <!-- Budget Summary -->
    <div class="budget-summary ${progress.isOverBudget ? 'over-budget' : ''}">
      <div class="budget-item">
        <div class="budget-label">Total Budget</div>
        <div class="budget-amount">${list.currency} ${list.total_budget.toFixed(2)}</div>
      </div>
      <div class="budget-item">
        <div class="budget-label">Estimated Total</div>
        <div class="budget-amount">${list.currency} ${list.total_estimated.toFixed(2)}</div>
      </div>
      <div class="budget-item">
        <div class="budget-label">Remaining</div>
        <div class="budget-amount">${list.currency} ${progress.remaining.toFixed(2)}</div>
      </div>
      <div class="budget-item">
        <div class="budget-label">Progress</div>
        <div class="budget-amount">${progress.percentage.toFixed(0)}%</div>
      </div>
    </div>

    ${progress.isOverBudget ? `
      <div class="warning-banner">
      OVER BUDGET BY ${list.currency} ${Math.abs(progress.remaining).toFixed(2)}
      </div>
    ` : ''}

    <!-- Items Section -->
    <div class="items-section">
      <div class="section-title">Items (${list.item_count})</div>
      
      ${list.items.map((item, index) => `
        <div class="item">
          <div class="item-details">
            <div>
              <span class="item-number">${index + 1}</span>
              <span class="item-name">${item.item_name}</span>
            </div>
          </div>
          <div class="item-pricing">
            <div class="item-calculation">
              Qty: ${item.quantity} × ${list.currency} ${item.estimated_price.toFixed(2)}
            </div>
            <div class="item-total">
              ${list.currency} ${(item.estimated_price * item.quantity).toFixed(2)}
            </div>
          </div>
        </div>
      `).join('')}
    </div>

    <!-- Totals Section -->
    <div class="totals-section">
      <div class="total-row">
        <span>Subtotal (${list.item_count} items)</span>
        <span>${list.currency} ${list.total_estimated.toFixed(2)}</span>
      </div>
      <div class="total-row grand-total">
        <span>Total Budget</span>
        <span>${list.currency} ${list.total_budget.toFixed(2)}</span>
      </div>
      <div class="total-row remaining">
        <span>${progress.isOverBudget ? 'Over Budget' : 'Remaining Budget'}</span>
        <span>${list.currency} ${Math.abs(progress.remaining).toFixed(2)}</span>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-date">Generated on ${currentDate}</div>
      <div class="footer-branding">
        Powered by TrackMate • Budget Planning & Expense Tracking
      </div>
    </div>
  </div>
</body>
</html>
  `;
}
