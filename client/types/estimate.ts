export interface MaterialItem {
  id: string;
  item_name: string;
  description?: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total: number;
}

export interface LaborItem {
  id: string;
  service_description: string;
  labor_rate: number;
  rate_type: 'fixed' | 'hourly' | 'daily';
  hours_days?: number;
  total: number;
}

export interface AdditionalCharge {
  id: string;
  description: string;
  amount: number;
}

export interface Estimate {
  id: string;
  estimate_number: string;
  estimate_date: string;
  valid_until: string;
  currency: string;
  
  // Project Details
  project_name: string;
  project_description?: string;
  job_category?: string;
  job_location?: string;
  start_date?: string;
  completion_date?: string;
  
  // Client Information
  client_name: string;
  client_company?: string;
  client_phone: string;
  client_email?: string;
  client_address?: string;
  
  // Worker/Business Information
  worker_name: string;
  worker_contact_person?: string;
  worker_phone: string;
  worker_email?: string;
  worker_address?: string;
  worker_logo?: string;
  
  // Items
  materials: MaterialItem[];
  labor: LaborItem[];
  additional_charges: AdditionalCharge[];
  
  // Cost Summary
  materials_subtotal: number;
  labor_subtotal: number;
  additional_charges_subtotal: number;
  discount_amount: number;
  tax_rate: number;
  tax_amount: number;
  total_cost: number;
  
  // Payment Information
  payment_terms: string;
  payment_methods: string;
  deposit_amount?: number;
  balance_due: number;
  
  // Notes & Terms
  notes?: string;
  terms_conditions?: string;
  warranty_info?: string;
  
  // Status
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface EstimateFormData {
  project_name: string;
  project_description?: string;
  job_category?: string;
  job_location?: string;
  start_date?: string;
  completion_date?: string;
  
  client_name: string;
  client_company?: string;
  client_phone: string;
  client_email?: string;
  client_address?: string;
  
  worker_name: string;
  worker_contact_person?: string;
  worker_phone: string;
  worker_email?: string;
  worker_address?: string;
  
  materials: MaterialItem[];
  labor: LaborItem[];
  additional_charges: AdditionalCharge[];
  
  discount_amount: number;
  tax_rate: number;
  
  payment_terms: string;
  payment_methods: string;
  deposit_amount?: number;
  
  notes?: string;
  terms_conditions?: string;
  warranty_info?: string;
  
  valid_until: string;
  currency: string;
}
