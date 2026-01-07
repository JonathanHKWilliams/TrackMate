-- Estimates and Estimate Items Schema for TrackMate
-- Run this script in your Supabase SQL editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables and policies if they exist
DROP TABLE IF EXISTS estimate_additional_charges CASCADE;
DROP TABLE IF EXISTS estimate_labor CASCADE;
DROP TABLE IF EXISTS estimate_materials CASCADE;
DROP TABLE IF EXISTS estimate_items CASCADE;
DROP TABLE IF EXISTS estimates CASCADE;

-- Estimates table
CREATE TABLE estimates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    estimate_number TEXT NOT NULL,
    estimate_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    currency TEXT NOT NULL DEFAULT 'LRD',
    
    -- Project Details
    project_name TEXT NOT NULL,
    project_description TEXT,
    job_category TEXT,
    job_location TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    completion_date TIMESTAMP WITH TIME ZONE,
    
    -- Client Information
    client_name TEXT NOT NULL,
    client_company TEXT,
    client_phone TEXT NOT NULL,
    client_email TEXT,
    client_address TEXT,
    
    -- Worker/Business Information
    worker_name TEXT NOT NULL,
    worker_contact_person TEXT,
    worker_phone TEXT NOT NULL,
    worker_email TEXT,
    worker_address TEXT,
    worker_logo TEXT,
    
    -- Cost Summary
    materials_subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    labor_subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    additional_charges_subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
    
    -- Payment Information
    payment_terms TEXT NOT NULL DEFAULT 'Payment due within 30 days',
    payment_methods TEXT NOT NULL DEFAULT 'Cash, Bank Transfer',
    deposit_amount DECIMAL(10,2),
    balance_due DECIMAL(10,2) NOT NULL DEFAULT 0,
    
    -- Notes & Terms
    notes TEXT,
    terms_conditions TEXT,
    warranty_info TEXT,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Material Items table
CREATE TABLE estimate_materials (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    estimate_id UUID REFERENCES estimates(id) ON DELETE CASCADE NOT NULL,
    item_name TEXT NOT NULL,
    description TEXT,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit TEXT NOT NULL DEFAULT 'pcs',
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Labor Items table
CREATE TABLE estimate_labor (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    estimate_id UUID REFERENCES estimates(id) ON DELETE CASCADE NOT NULL,
    service_description TEXT NOT NULL,
    labor_rate DECIMAL(10,2) NOT NULL DEFAULT 0,
    rate_type TEXT NOT NULL DEFAULT 'fixed' CHECK (rate_type IN ('fixed', 'hourly', 'daily')),
    hours_days DECIMAL(10,2),
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Additional Charges table
CREATE TABLE estimate_additional_charges (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    estimate_id UUID REFERENCES estimates(id) ON DELETE CASCADE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security Policies
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimate_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimate_labor ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimate_additional_charges ENABLE ROW LEVEL SECURITY;

-- Estimates RLS Policies
CREATE POLICY "Users can view own estimates" ON estimates
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own estimates" ON estimates
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own estimates" ON estimates
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own estimates" ON estimates
    FOR DELETE USING (auth.uid() = user_id);

-- Materials RLS Policies
CREATE POLICY "Users can view own materials" ON estimate_materials
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM estimates 
            WHERE estimates.id = estimate_materials.estimate_id 
            AND estimates.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own materials" ON estimate_materials
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM estimates 
            WHERE estimates.id = estimate_materials.estimate_id 
            AND estimates.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own materials" ON estimate_materials
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM estimates 
            WHERE estimates.id = estimate_materials.estimate_id 
            AND estimates.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own materials" ON estimate_materials
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM estimates 
            WHERE estimates.id = estimate_materials.estimate_id 
            AND estimates.user_id = auth.uid()
        )
    );

-- Labor RLS Policies
CREATE POLICY "Users can view own labor" ON estimate_labor
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM estimates 
            WHERE estimates.id = estimate_labor.estimate_id 
            AND estimates.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own labor" ON estimate_labor
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM estimates 
            WHERE estimates.id = estimate_labor.estimate_id 
            AND estimates.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own labor" ON estimate_labor
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM estimates 
            WHERE estimates.id = estimate_labor.estimate_id 
            AND estimates.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own labor" ON estimate_labor
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM estimates 
            WHERE estimates.id = estimate_labor.estimate_id 
            AND estimates.user_id = auth.uid()
        )
    );

-- Additional Charges RLS Policies
CREATE POLICY "Users can view own charges" ON estimate_additional_charges
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM estimates 
            WHERE estimates.id = estimate_additional_charges.estimate_id 
            AND estimates.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own charges" ON estimate_additional_charges
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM estimates 
            WHERE estimates.id = estimate_additional_charges.estimate_id 
            AND estimates.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own charges" ON estimate_additional_charges
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM estimates 
            WHERE estimates.id = estimate_additional_charges.estimate_id 
            AND estimates.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own charges" ON estimate_additional_charges
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM estimates 
            WHERE estimates.id = estimate_additional_charges.estimate_id 
            AND estimates.user_id = auth.uid()
        )
    );

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_estimates_user_id ON estimates(user_id);
CREATE INDEX IF NOT EXISTS idx_estimates_status ON estimates(status);
CREATE INDEX IF NOT EXISTS idx_estimates_created_at ON estimates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_estimate_materials_estimate_id ON estimate_materials(estimate_id);
CREATE INDEX IF NOT EXISTS idx_estimate_labor_estimate_id ON estimate_labor(estimate_id);
CREATE INDEX IF NOT EXISTS idx_estimate_charges_estimate_id ON estimate_additional_charges(estimate_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_estimates_updated_at 
    BEFORE UPDATE ON estimates 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
