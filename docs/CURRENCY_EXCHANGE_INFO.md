# Currency Exchange Rate Information

## Current Implementation

The TrackMate estimate feature now supports **multi-currency** estimates with the following currencies:
- **LRD** (Liberian Dollar)
- **USD** (US Dollar)
- **EUR** (Euro)
- **GBP** (British Pound)

## How It Works

### User Input
When creating an estimate, users:
1. Select their preferred currency from the dropdown
2. Enter all prices (materials, labor, charges) in that selected currency
3. All calculations and totals are displayed in the selected currency

### Important Notes

**The app does NOT automatically convert between currencies.** 

When you select a currency:
- You enter prices in that currency
- The app calculates totals in that currency
- The estimate is saved and displayed in that currency

### Example Usage

**For Liberian Workers (LRD):**
- Select "LRD" as currency
- Enter material prices in LRD (e.g., 1800 LRD for cement)
- Enter labor rates in LRD (e.g., 5000 LRD per day)
- Total will be calculated in LRD

**For International Workers (USD):**
- Select "USD" as currency
- Enter material prices in USD (e.g., 10 USD for cement)
- Enter labor rates in USD (e.g., 50 USD per day)
- Total will be calculated in USD

## Exchange Rate Reference (Manual)

As of current market rates:
- **1 USD = 180 LRD** (approximately)
- **1 EUR = 195 LRD** (approximately)
- **1 GBP = 230 LRD** (approximately)

**Note:** These rates are for reference only. Users must manually calculate and enter prices in their chosen currency.

## Future Enhancement Options

To add automatic currency conversion, you would need to:

1. **Integrate a Currency API** (e.g., exchangerate-api.com, fixer.io)
2. **Add a base currency setting** in user profile
3. **Store exchange rates** in the database
4. **Auto-convert** when displaying estimates in different currencies

### Example Implementation (Future):
```typescript
// Fetch current exchange rates
const getExchangeRate = async (from: string, to: string) => {
  const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);
  const data = await response.json();
  return data.rates[to];
};

// Convert amount
const convertCurrency = (amount: number, rate: number) => {
  return amount * rate;
};
```

## Current Workaround

**For workers who need to work with multiple currencies:**

1. **Know your exchange rate** (e.g., 180 LRD = 1 USD)
2. **Calculate before entering:**
   - If material costs 10 USD and you want to quote in LRD
   - Calculate: 10 × 180 = 1800 LRD
   - Enter 1800 in the LRD estimate

3. **Or create separate estimates:**
   - One estimate in LRD for local clients
   - One estimate in USD for international clients

## Benefits of Current System

✅ **Simple and clear** - No confusion about conversions
✅ **Accurate** - User controls exact prices
✅ **Flexible** - Works for any currency
✅ **No API dependency** - Works offline
✅ **No conversion errors** - What you enter is what you get

## Recommendation

For Liberian workers:
- Use **LRD** for local clients
- Use **USD** for international clients or when materials are priced in USD
- Keep track of current exchange rates manually
- Update your prices based on current market rates
