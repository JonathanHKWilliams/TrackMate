-- Fix payment method constraint to include mobile_money
ALTER TABLE expenses 
DROP CONSTRAINT IF EXISTS expenses_payment_method_check;

ALTER TABLE expenses 
ADD CONSTRAINT expenses_payment_method_check 
CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'bank_transfer', 'digital_wallet', 'mobile_money', 'other'));
