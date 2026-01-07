import { supabase } from '../lib/supabase';
import { Estimate, MaterialItem, LaborItem, AdditionalCharge } from '../types/estimate';

export const estimateService = {
  async getEstimates(): Promise<Estimate[]> {
    const { data, error } = await supabase
      .from('estimates')
      .select(`
        *,
        estimate_materials (*),
        estimate_labor (*),
        estimate_additional_charges (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data.map(estimate => ({
      ...estimate,
      materials: estimate.estimate_materials || [],
      labor: estimate.estimate_labor || [],
      additional_charges: estimate.estimate_additional_charges || []
    }));
  },

  async getEstimateById(id: string): Promise<Estimate> {
    const { data, error } = await supabase
      .from('estimates')
      .select(`
        *,
        estimate_materials (*),
        estimate_labor (*),
        estimate_additional_charges (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    
    return {
      ...data,
      materials: data.estimate_materials || [],
      labor: data.estimate_labor || [],
      additional_charges: data.estimate_additional_charges || []
    };
  },

  async createEstimate(estimateData: Partial<Estimate>): Promise<Estimate> {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Calculate totals
    const materialsSubtotal = estimateData.materials?.reduce((sum, item) => sum + item.total, 0) || 0;
    const laborSubtotal = estimateData.labor?.reduce((sum, item) => sum + item.total, 0) || 0;
    const additionalChargesSubtotal = estimateData.additional_charges?.reduce((sum, item) => sum + item.amount, 0) || 0;
    
    const subtotal = materialsSubtotal + laborSubtotal + additionalChargesSubtotal;
    const discountAmount = estimateData.discount_amount || 0;
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * (estimateData.tax_rate || 0) / 100;
    const totalCost = afterDiscount + taxAmount;
    const depositAmount = estimateData.deposit_amount || 0;
    const balanceDue = totalCost - depositAmount;

    // Generate estimate number
    const estimateNumber = `EST-${Date.now().toString().slice(-8)}`;

    // Prepare valid_until date - ensure it's a valid date or null
    let validUntilDate = null;
    if (estimateData.valid_until && estimateData.valid_until.trim() !== '') {
      validUntilDate = estimateData.valid_until;
    }

    // Create estimate
    const { data: estimate, error: estimateError } = await supabase
      .from('estimates')
      .insert({
        user_id: user.id,
        estimate_number: estimateNumber,
        estimate_date: new Date().toISOString(),
        valid_until: validUntilDate,
        currency: estimateData.currency || 'LRD',
        
        project_name: estimateData.project_name,
        project_description: estimateData.project_description,
        job_category: estimateData.job_category,
        job_location: estimateData.job_location,
        start_date: estimateData.start_date || null,
        completion_date: estimateData.completion_date || null,
        
        client_name: estimateData.client_name,
        client_company: estimateData.client_company,
        client_phone: estimateData.client_phone,
        client_email: estimateData.client_email,
        client_address: estimateData.client_address,
        
        worker_name: estimateData.worker_name,
        worker_contact_person: estimateData.worker_contact_person,
        worker_phone: estimateData.worker_phone,
        worker_email: estimateData.worker_email,
        worker_address: estimateData.worker_address,
        
        materials_subtotal: materialsSubtotal,
        labor_subtotal: laborSubtotal,
        additional_charges_subtotal: additionalChargesSubtotal,
        discount_amount: discountAmount,
        tax_rate: estimateData.tax_rate || 0,
        tax_amount: taxAmount,
        total_cost: totalCost,
        
        payment_terms: estimateData.payment_terms,
        payment_methods: estimateData.payment_methods,
        deposit_amount: depositAmount,
        balance_due: balanceDue,
        
        notes: estimateData.notes,
        terms_conditions: estimateData.terms_conditions,
        warranty_info: estimateData.warranty_info,
        
        status: 'draft',
      })
      .select()
      .single();

    if (estimateError) throw estimateError;

    // Insert materials
    if (estimateData.materials && estimateData.materials.length > 0) {
      const materialsToInsert = estimateData.materials.map(item => ({
        estimate_id: estimate.id,
        item_name: item.item_name,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: item.unit_price,
        total: item.total,
      }));

      const { error: materialsError } = await supabase
        .from('estimate_materials')
        .insert(materialsToInsert);

      if (materialsError) throw materialsError;
    }

    // Insert labor
    if (estimateData.labor && estimateData.labor.length > 0) {
      const laborToInsert = estimateData.labor.map(item => ({
        estimate_id: estimate.id,
        service_description: item.service_description,
        labor_rate: item.labor_rate,
        rate_type: item.rate_type,
        hours_days: item.hours_days,
        total: item.total,
      }));

      const { error: laborError } = await supabase
        .from('estimate_labor')
        .insert(laborToInsert);

      if (laborError) throw laborError;
    }

    // Insert additional charges
    if (estimateData.additional_charges && estimateData.additional_charges.length > 0) {
      const chargesToInsert = estimateData.additional_charges.map(item => ({
        estimate_id: estimate.id,
        description: item.description,
        amount: item.amount,
      }));

      const { error: chargesError } = await supabase
        .from('estimate_additional_charges')
        .insert(chargesToInsert);

      if (chargesError) throw chargesError;
    }

    return estimateService.getEstimateById(estimate.id);
  },

  async updateEstimate(id: string, estimateData: Partial<Estimate>): Promise<Estimate> {
    // Calculate totals if items are provided
    const materialsSubtotal = estimateData.materials?.reduce((sum, item) => sum + item.total, 0) || 0;
    const laborSubtotal = estimateData.labor?.reduce((sum, item) => sum + item.total, 0) || 0;
    const additionalChargesSubtotal = estimateData.additional_charges?.reduce((sum, item) => sum + item.amount, 0) || 0;
    
    const subtotal = materialsSubtotal + laborSubtotal + additionalChargesSubtotal;
    const discountAmount = estimateData.discount_amount || 0;
    const afterDiscount = subtotal - discountAmount;
    const taxAmount = afterDiscount * (estimateData.tax_rate || 0) / 100;
    const totalCost = afterDiscount + taxAmount;
    const depositAmount = estimateData.deposit_amount || 0;
    const balanceDue = totalCost - depositAmount;

    // Update estimate
    const { data, error } = await supabase
      .from('estimates')
      .update({
        project_name: estimateData.project_name,
        project_description: estimateData.project_description,
        job_category: estimateData.job_category,
        job_location: estimateData.job_location,
        start_date: estimateData.start_date?.trim() || null,
        completion_date: estimateData.completion_date?.trim() || null,
        
        client_name: estimateData.client_name,
        client_company: estimateData.client_company,
        client_phone: estimateData.client_phone,
        client_email: estimateData.client_email,
        client_address: estimateData.client_address,
        
        worker_name: estimateData.worker_name,
        worker_contact_person: estimateData.worker_contact_person,
        worker_phone: estimateData.worker_phone,
        worker_email: estimateData.worker_email,
        worker_address: estimateData.worker_address,
        
        materials_subtotal: materialsSubtotal,
        labor_subtotal: laborSubtotal,
        additional_charges_subtotal: additionalChargesSubtotal,
        discount_amount: discountAmount,
        tax_rate: estimateData.tax_rate,
        tax_amount: taxAmount,
        total_cost: totalCost,
        
        payment_terms: estimateData.payment_terms,
        payment_methods: estimateData.payment_methods,
        deposit_amount: depositAmount,
        balance_due: balanceDue,
        
        notes: estimateData.notes,
        terms_conditions: estimateData.terms_conditions,
        warranty_info: estimateData.warranty_info,
        
        status: estimateData.status,
        valid_until: estimateData.valid_until?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Update materials
    if (estimateData.materials) {
      await supabase.from('estimate_materials').delete().eq('estimate_id', id);
      
      if (estimateData.materials.length > 0) {
        const materialsToInsert = estimateData.materials.map(item => ({
          estimate_id: id,
          item_name: item.item_name,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
          total: item.total,
        }));

        await supabase.from('estimate_materials').insert(materialsToInsert);
      }
    }

    // Update labor
    if (estimateData.labor) {
      await supabase.from('estimate_labor').delete().eq('estimate_id', id);
      
      if (estimateData.labor.length > 0) {
        const laborToInsert = estimateData.labor.map(item => ({
          estimate_id: id,
          service_description: item.service_description,
          labor_rate: item.labor_rate,
          rate_type: item.rate_type,
          hours_days: item.hours_days,
          total: item.total,
        }));

        await supabase.from('estimate_labor').insert(laborToInsert);
      }
    }

    // Update additional charges
    if (estimateData.additional_charges) {
      await supabase.from('estimate_additional_charges').delete().eq('estimate_id', id);
      
      if (estimateData.additional_charges.length > 0) {
        const chargesToInsert = estimateData.additional_charges.map(item => ({
          estimate_id: id,
          description: item.description,
          amount: item.amount,
        }));

        await supabase.from('estimate_additional_charges').insert(chargesToInsert);
      }
    }

    return estimateService.getEstimateById(id);
  },

  async deleteEstimate(id: string): Promise<void> {
    await supabase.from('estimate_materials').delete().eq('estimate_id', id);
    await supabase.from('estimate_labor').delete().eq('estimate_id', id);
    await supabase.from('estimate_additional_charges').delete().eq('estimate_id', id);

    const { error } = await supabase.from('estimates').delete().eq('id', id);
    if (error) throw error;
  },
};

// Export individual functions for convenience
export const getEstimates = estimateService.getEstimates;
export const getEstimateById = estimateService.getEstimateById;
export const createEstimate = estimateService.createEstimate;
export const updateEstimate = estimateService.updateEstimate;
export const deleteEstimate = estimateService.deleteEstimate;
