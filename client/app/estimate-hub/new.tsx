import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEstimate } from '../../contexts/EstimateContext';
import { MaterialItem, LaborItem, AdditionalCharge, EstimateFormData } from '../../types/estimate';
import { useAuth } from '../../contexts/AuthContext';

export default function NewEstimateScreen() {
  const router = useRouter();
  const { createEstimate } = useEstimate();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showWorkmanshipPicker, setShowWorkmanshipPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPaymentMethodsPicker, setShowPaymentMethodsPicker] = useState(false);
  const [customDate, setCustomDate] = useState('');
  
  const currencies = ['LRD', 'USD', 'EUR', 'GBP'];
  const jobCategories = ['Electrical', 'Plumbing', 'Painting', 'Carpentry', 'Masonry', 'Roofing', 'General Construction', 'Other'];
  const workmanshipTypes = ['Installation', 'Repair', 'Maintenance', 'Renovation', 'Construction', 'Assembly', 'Custom Work', 'Consultation'];
  const paymentMethods = ['Cash', 'Bank Transfer', 'Mobile Money', 'Orange Money', 'Check', 'Credit Card', 'Multiple Methods'];

  const [formData, setFormData] = useState<EstimateFormData>({
    // Project Details
    project_name: '',
    project_description: '',
    job_category: '',
    job_location: '',
    start_date: undefined,
    completion_date: undefined,
    
    // Client Info
    client_name: '',
    client_company: '',
    client_phone: '',
    client_email: '',
    client_address: '',
    
    // Worker Info
    worker_name: user?.user_metadata?.full_name || '',
    worker_contact_person: '',
    worker_phone: '',
    worker_email: user?.email || '',
    worker_address: '',
    
    // Items
    materials: [],
    labor: [],
    additional_charges: [],
    
    // Costs
    discount_amount: 0,
    tax_rate: 0,
    
    // Payment
    payment_terms: 'Payment due within 30 days',
    payment_methods: 'Cash, Bank Transfer, Mobile Money',
    deposit_amount: 0,
    
    // Notes
    notes: '',
    terms_conditions: 'All work will be completed as per agreed specifications.',
    warranty_info: '',
    
    // Metadata
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currency: 'LRD',
  });

  // Material form state
  const [materialForm, setMaterialForm] = useState({
    item_name: '',
    description: '',
    quantity: 1,
    unit: 'pcs',
    unit_price: 0,
  });

  // Labor form state
  const [laborForm, setLaborForm] = useState({
    service_description: '',
    labor_rate: 0,
    rate_type: 'fixed' as 'fixed' | 'hourly' | 'daily',
    hours_days: 0,
  });

  // Additional charge form state
  const [chargeForm, setChargeForm] = useState({
    description: '',
    amount: 0,
  });

  const addMaterial = () => {
    if (!materialForm.item_name || materialForm.unit_price <= 0) {
      Alert.alert('Error', 'Please enter item name and unit price');
      return;
    }

    const total = materialForm.quantity * materialForm.unit_price;
    const newMaterial: MaterialItem = {
      id: Date.now().toString(),
      item_name: materialForm.item_name,
      description: materialForm.description,
      quantity: materialForm.quantity,
      unit: materialForm.unit,
      unit_price: materialForm.unit_price,
      total,
    };

    setFormData(prev => ({ ...prev, materials: [...prev.materials, newMaterial] }));
    setMaterialForm({ item_name: '', description: '', quantity: 1, unit: 'pcs', unit_price: 0 });
  };

  const removeMaterial = (id: string) => {
    setFormData(prev => ({ ...prev, materials: prev.materials.filter(m => m.id !== id) }));
  };

  const addLabor = () => {
    if (!laborForm.service_description || laborForm.labor_rate <= 0) {
      Alert.alert('Error', 'Please enter service description and labor rate');
      return;
    }

    let total = laborForm.labor_rate;
    if (laborForm.rate_type !== 'fixed' && laborForm.hours_days) {
      total = laborForm.labor_rate * laborForm.hours_days;
    }

    const newLabor: LaborItem = {
      id: Date.now().toString(),
      service_description: laborForm.service_description,
      labor_rate: laborForm.labor_rate,
      rate_type: laborForm.rate_type,
      hours_days: laborForm.hours_days,
      total,
    };

    setFormData(prev => ({ ...prev, labor: [...prev.labor, newLabor] }));
    setLaborForm({ service_description: '', labor_rate: 0, rate_type: 'fixed', hours_days: 0 });
  };

  const removeLabor = (id: string) => {
    setFormData(prev => ({ ...prev, labor: prev.labor.filter(l => l.id !== id) }));
  };

  const addCharge = () => {
    if (!chargeForm.description || chargeForm.amount <= 0) {
      Alert.alert('Error', 'Please enter description and amount');
      return;
    }

    const newCharge: AdditionalCharge = {
      id: Date.now().toString(),
      description: chargeForm.description,
      amount: chargeForm.amount,
    };

    setFormData(prev => ({ ...prev, additional_charges: [...prev.additional_charges, newCharge] }));
    setChargeForm({ description: '', amount: 0 });
  };

  const removeCharge = (id: string) => {
    setFormData(prev => ({ ...prev, additional_charges: prev.additional_charges.filter(c => c.id !== id) }));
  };

  const calculateTotals = () => {
    const materialsSubtotal = formData.materials.reduce((sum, item) => sum + item.total, 0);
    const laborSubtotal = formData.labor.reduce((sum, item) => sum + item.total, 0);
    const additionalChargesSubtotal = formData.additional_charges.reduce((sum, item) => sum + item.amount, 0);
    
    const subtotal = materialsSubtotal + laborSubtotal + additionalChargesSubtotal;
    const afterDiscount = subtotal - formData.discount_amount;
    const taxAmount = afterDiscount * formData.tax_rate / 100;
    const total = afterDiscount + taxAmount;
    const balanceDue = total - (formData.deposit_amount || 0);

    return { materialsSubtotal, laborSubtotal, additionalChargesSubtotal, subtotal, afterDiscount, taxAmount, total, balanceDue };
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.project_name || !formData.client_name || !formData.client_phone) {
          Alert.alert('Required Fields', 'Please fill in project name, client name, and client phone');
          return false;
        }
        return true;
      case 2:
        if (!formData.worker_name || !formData.worker_phone) {
          Alert.alert('Required Fields', 'Please fill in worker name and phone');
          return false;
        }
        return true;
      case 3:
      case 4:
      case 5:
        return true;
      case 6:
        if (formData.materials.length === 0 && formData.labor.length === 0) {
          Alert.alert('Required Items', 'Please add at least one material or labor item');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(6)) return;

    try {
      // Clean up the form data before submitting
      const cleanedData = {
        ...formData,
        start_date: formData.start_date || undefined,
        completion_date: formData.completion_date || undefined,
      };
      
      await createEstimate(cleanedData);
      Alert.alert('Success', 'Estimate created successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Estimate creation error:', error);
      Alert.alert('Error', 'Failed to create estimate. Please check your inputs and try again.');
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      {[1, 2, 3, 4, 5, 6].map((step) => (
        <View key={step} style={styles.progressStepContainer}>
          <View style={[
            styles.progressDot,
            currentStep >= step && styles.progressDotActive
          ]}>
            {currentStep > step ? (
              <Ionicons name="checkmark" size={16} color="#FFF" />
            ) : (
              <Text style={styles.progressDotText}>{step}</Text>
            )}
          </View>
          {step < 6 && (
            <View style={[
              styles.progressLine,
              currentStep > step && styles.progressLineActive
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <ScrollView 
      style={styles.stepContent}
      contentContainerStyle={styles.scrollContentContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.stepTitle}>Project & Client Information</Text>
      
      <Text style={styles.sectionLabel}>Project Details</Text>
      <TextInput
        style={styles.input}
        placeholder="Project Name *"
        placeholderTextColor="#666"
        value={formData.project_name}
        onChangeText={(text) => setFormData(prev => ({ ...prev, project_name: text }))}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Project Description"
        placeholderTextColor="#666"
        value={formData.project_description}
        onChangeText={(text) => setFormData(prev => ({ ...prev, project_description: text }))}
        multiline
        numberOfLines={3}
      />
      
      <Text style={styles.inputLabel}>Job Category</Text>
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setShowCategoryPicker(true)}
      >
        <Text style={formData.job_category ? styles.pickerButtonTextSelected : styles.pickerButtonText}>
          {formData.job_category || 'Select Job Category'}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#B0B0B0" />
      </TouchableOpacity>
      
      <TextInput
        style={styles.input}
        placeholder="Job Location"
        placeholderTextColor="#666"
        value={formData.job_location}
        onChangeText={(text) => setFormData(prev => ({ ...prev, job_location: text }))}
      />

      <Text style={styles.sectionLabel}>Client Information</Text>
      <TextInput
        style={styles.input}
        placeholder="Client Name *"
        placeholderTextColor="#666"
        value={formData.client_name}
        onChangeText={(text) => setFormData(prev => ({ ...prev, client_name: text }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Company Name"
        placeholderTextColor="#666"
        value={formData.client_company}
        onChangeText={(text) => setFormData(prev => ({ ...prev, client_company: text }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number *"
        placeholderTextColor="#666"
        value={formData.client_phone}
        onChangeText={(text) => setFormData(prev => ({ ...prev, client_phone: text }))}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        placeholderTextColor="#666"
        value={formData.client_email}
        onChangeText={(text) => setFormData(prev => ({ ...prev, client_email: text }))}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Client Address"
        placeholderTextColor="#666"
        value={formData.client_address}
        onChangeText={(text) => setFormData(prev => ({ ...prev, client_address: text }))}
      />
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView 
      style={styles.stepContent}
      contentContainerStyle={styles.scrollContentContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.stepTitle}>Worker / Business Information</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Your Name / Business Name *"
        placeholderTextColor="#666"
        value={formData.worker_name}
        onChangeText={(text) => setFormData(prev => ({ ...prev, worker_name: text }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Contact Person"
        placeholderTextColor="#666"
        value={formData.worker_contact_person}
        onChangeText={(text) => setFormData(prev => ({ ...prev, worker_contact_person: text }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number *"
        placeholderTextColor="#666"
        value={formData.worker_phone}
        onChangeText={(text) => setFormData(prev => ({ ...prev, worker_phone: text }))}
        keyboardType="phone-pad"
      />
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        placeholderTextColor="#666"
        value={formData.worker_email}
        onChangeText={(text) => setFormData(prev => ({ ...prev, worker_email: text }))}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Business Address / Service Area"
        placeholderTextColor="#666"
        value={formData.worker_address}
        onChangeText={(text) => setFormData(prev => ({ ...prev, worker_address: text }))}
      />
    </ScrollView>
  );

  const renderStep3 = () => (
    <ScrollView 
      style={styles.stepContent}
      contentContainerStyle={styles.scrollContentContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.stepTitle}>Materials</Text>
      
      <View style={styles.addItemForm}>
        <TextInput
          style={styles.input}
          placeholder="Item Name *"
          placeholderTextColor="#666"
          value={materialForm.item_name}
          onChangeText={(text) => setMaterialForm(prev => ({ ...prev, item_name: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Description"
          placeholderTextColor="#666"
          value={materialForm.description}
          onChangeText={(text) => setMaterialForm(prev => ({ ...prev, description: text }))}
        />
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.smallInput]}
            placeholder="Qty"
            placeholderTextColor="#666"
            value={materialForm.quantity === 1 ? '' : materialForm.quantity.toString()}
            onChangeText={(text) => setMaterialForm(prev => ({ ...prev, quantity: parseFloat(text) || 1 }))}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, styles.smallInput]}
            placeholder="Unit"
            placeholderTextColor="#666"
            value={materialForm.unit === 'pcs' ? '' : materialForm.unit}
            onChangeText={(text) => setMaterialForm(prev => ({ ...prev, unit: text || 'pcs' }))}
          />
          <TextInput
            style={[styles.input, styles.smallInput]}
            placeholder="Price"
            placeholderTextColor="#666"
            value={materialForm.unit_price === 0 ? '' : materialForm.unit_price.toString()}
            onChangeText={(text) => setMaterialForm(prev => ({ ...prev, unit_price: parseFloat(text) || 0 }))}
            keyboardType="numeric"
          />
        </View>
        <TouchableOpacity style={styles.addButton} onPress={addMaterial}>
          <Ionicons name="add" size={20} color="#FFF" />
          <Text style={styles.addButtonText}>Add Material</Text>
        </TouchableOpacity>
      </View>

      {formData.materials.map((item) => (
        <View key={item.id} style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemName}>{item.item_name}</Text>
            <TouchableOpacity onPress={() => removeMaterial(item.id)}>
              <Ionicons name="trash" size={20} color="#F44336" />
            </TouchableOpacity>
          </View>
          {item.description && <Text style={styles.itemDescription}>{item.description}</Text>}
          <View style={styles.itemFooter}>
            <Text style={styles.itemDetails}>{item.quantity} {item.unit} × {formData.currency} {item.unit_price.toFixed(2)}</Text>
            <Text style={styles.itemTotal}>{formData.currency} {item.total.toFixed(2)}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderStep4 = () => (
    <ScrollView 
      style={styles.stepContent}
      contentContainerStyle={styles.scrollContentContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.stepTitle}>Labor / Workmanship</Text>
      
      <View style={styles.addItemForm}>
        <Text style={styles.inputLabel}>Workmanship Type</Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setShowWorkmanshipPicker(true)}
        >
          <Text style={laborForm.service_description ? styles.pickerButtonTextSelected : styles.pickerButtonText}>
            {laborForm.service_description || 'Select Workmanship Type'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#B0B0B0" />
        </TouchableOpacity>
        
        <View style={styles.rateTypeRow}>
          {(['fixed', 'hourly', 'daily'] as const).map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.rateTypeButton, laborForm.rate_type === type && styles.rateTypeButtonActive]}
              onPress={() => setLaborForm(prev => ({ ...prev, rate_type: type }))}
            >
              <Text style={[styles.rateTypeText, laborForm.rate_type === type && styles.rateTypeTextActive]}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.halfInput]}
            placeholder="Labor Rate"
            placeholderTextColor="#666"
            value={laborForm.labor_rate === 0 ? '' : laborForm.labor_rate.toString()}
            onChangeText={(text) => setLaborForm(prev => ({ ...prev, labor_rate: parseFloat(text) || 0 }))}
            keyboardType="numeric"
          />
          {laborForm.rate_type !== 'fixed' && (
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder={laborForm.rate_type === 'hourly' ? 'Hours' : 'Days'}
              placeholderTextColor="#666"
              value={laborForm.hours_days?.toString() || ''}
              onChangeText={(text) => setLaborForm(prev => ({ ...prev, hours_days: parseFloat(text) || 0 }))}
              keyboardType="numeric"
            />
          )}
        </View>

        <TouchableOpacity style={styles.addButton} onPress={addLabor}>
          <Ionicons name="add" size={20} color="#FFF" />
          <Text style={styles.addButtonText}>Add Labor</Text>
        </TouchableOpacity>
      </View>

      {formData.labor.map((item) => (
        <View key={item.id} style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemName}>{item.service_description}</Text>
            <TouchableOpacity onPress={() => removeLabor(item.id)}>
              <Ionicons name="trash" size={20} color="#F44336" />
            </TouchableOpacity>
          </View>
          <View style={styles.itemFooter}>
            <Text style={styles.itemDetails}>
              {item.rate_type === 'fixed' ? 'Fixed Rate' : `${item.hours_days} ${item.rate_type === 'hourly' ? 'hours' : 'days'} × ${formData.currency} ${item.labor_rate.toFixed(2)}`}
            </Text>
            <Text style={styles.itemTotal}>{formData.currency} {item.total.toFixed(2)}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderStep5 = () => (
    <ScrollView 
      style={styles.stepContent}
      contentContainerStyle={styles.scrollContentContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.stepTitle}>Additional Charges</Text>
      <Text style={styles.stepSubtitle}>Transportation, tools, permits, etc.</Text>
      
      <View style={styles.addItemForm}>
        <TextInput
          style={styles.input}
          placeholder="Description"
          placeholderTextColor="#666"
          value={chargeForm.description}
          onChangeText={(text) => setChargeForm(prev => ({ ...prev, description: text }))}
        />
        <TextInput
          style={styles.input}
          placeholder="Amount"
          placeholderTextColor="#666"
          value={chargeForm.amount === 0 ? '' : chargeForm.amount.toString()}
          onChangeText={(text) => setChargeForm(prev => ({ ...prev, amount: parseFloat(text) || 0 }))}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.addButton} onPress={addCharge}>
          <Ionicons name="add" size={20} color="#FFF" />
          <Text style={styles.addButtonText}>Add Charge</Text>
        </TouchableOpacity>
      </View>

      {formData.additional_charges.map((item) => (
        <View key={item.id} style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemName}>{item.description}</Text>
            <TouchableOpacity onPress={() => removeCharge(item.id)}>
              <Ionicons name="trash" size={20} color="#F44336" />
            </TouchableOpacity>
          </View>
          <Text style={styles.itemTotal}>{formData.currency} {item.amount.toFixed(2)}</Text>
        </View>
      ))}
    </ScrollView>
  );

  const renderStep6 = () => {
    const totals = calculateTotals();
    
    return (
      <ScrollView 
        style={styles.stepContent}
        contentContainerStyle={styles.scrollContentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.stepTitle}>Payment & Summary</Text>
        
        <Text style={styles.sectionLabel}>Cost Summary</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Materials:</Text>
            <Text style={styles.summaryValue}>{formData.currency} {totals.materialsSubtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Labor:</Text>
            <Text style={styles.summaryValue}>{formData.currency} {totals.laborSubtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Additional Charges:</Text>
            <Text style={styles.summaryValue}>{formData.currency} {totals.additionalChargesSubtotal.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryDivider]}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>{formData.currency} {totals.subtotal.toFixed(2)}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Adjustments</Text>
        <TextInput
          style={styles.input}
          placeholder="Discount Amount"
          placeholderTextColor="#666"
          value={formData.discount_amount === 0 ? '' : formData.discount_amount.toString()}
          onChangeText={(text) => setFormData(prev => ({ ...prev, discount_amount: parseFloat(text) || 0 }))}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Tax Rate (%)"
          placeholderTextColor="#666"
          value={formData.tax_rate === 0 ? '' : formData.tax_rate?.toString()}
          onChangeText={(text) => setFormData(prev => ({ ...prev, tax_rate: parseFloat(text) || 0 }))}
          keyboardType="numeric"
        />

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Discount:</Text>
            <Text style={styles.summaryValue}>-{formData.currency} {formData.discount_amount.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax ({formData.tax_rate}%):</Text>
            <Text style={styles.summaryValue}>+{formData.currency} {totals.taxAmount.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>{formData.currency} {totals.total.toFixed(2)}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Payment Information</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Payment Terms (e.g., Payment due within 30 days)"
          placeholderTextColor="#666"
          value={formData.payment_terms}
          onChangeText={(text) => setFormData(prev => ({ ...prev, payment_terms: text }))}
          multiline
        />
        <Text style={styles.inputLabel}>Payment Methods</Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setShowPaymentMethodsPicker(true)}
        >
          <Text style={formData.payment_methods ? styles.pickerButtonTextSelected : styles.pickerButtonText}>
            {formData.payment_methods || 'Select Payment Methods'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#B0B0B0" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Deposit Amount (Optional)"
          placeholderTextColor="#666"
          value={formData.deposit_amount === 0 ? '' : formData.deposit_amount?.toString()}
          onChangeText={(text) => setFormData(prev => ({ ...prev, deposit_amount: parseFloat(text) || 0 }))}
          keyboardType="numeric"
        />

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Balance Due:</Text>
            <Text style={styles.totalValue}>{formData.currency} {totals.balanceDue.toFixed(2)}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>Currency & Validity</Text>
        <Text style={styles.inputLabel}>Currency</Text>
        <TouchableOpacity
          style={styles.pickerButton}
          onPress={() => setShowCurrencyPicker(true)}
        >
          <Text style={styles.pickerButtonTextSelected}>{formData.currency}</Text>
          <Ionicons name="chevron-down" size={20} color="#B0B0B0" />
        </TouchableOpacity>
        
        <Text style={styles.inputLabel}>Valid Until</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.pickerButton, { flex: 1, marginRight: 8 }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={formData.valid_until ? styles.pickerButtonTextSelected : styles.pickerButtonText}>
              {formData.valid_until ? new Date(formData.valid_until).toLocaleDateString() : 'Quick Select'}
            </Text>
            <Ionicons name="calendar-outline" size={20} color="#B0B0B0" />
          </TouchableOpacity>
          <TextInput
            style={[styles.input, { flex: 1, marginLeft: 8 }]}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#666"
            value={customDate}
            onChangeText={(text) => {
              setCustomDate(text);
              if (text.match(/^\d{4}-\d{2}-\d{2}$/)) {
                setFormData(prev => ({ ...prev, valid_until: text }));
              }
            }}
          />
        </View>

        <Text style={styles.sectionLabel}>Notes & Terms</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Notes (Any additional information for the client)"
          placeholderTextColor="#666"
          value={formData.notes}
          onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
          multiline
          numberOfLines={3}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Terms & Conditions (e.g., All work completed as per specifications)"
          placeholderTextColor="#666"
          value={formData.terms_conditions}
          onChangeText={(text) => setFormData(prev => ({ ...prev, terms_conditions: text }))}
          multiline
          numberOfLines={3}
        />
      </ScrollView>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      default: return null;
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>New Estimate</Text>
        <View style={{ width: 24 }} />
      </View>

      {renderProgressBar()}

      {renderCurrentStep()}

      <View style={styles.navigationButtons}>
        {currentStep > 1 && (
          <TouchableOpacity style={styles.navButton} onPress={prevStep}>
            <Ionicons name="arrow-back" size={20} color="#FFF" />
            <Text style={styles.navButtonText}>Back</Text>
          </TouchableOpacity>
        )}
        
        {currentStep < totalSteps ? (
          <TouchableOpacity style={[styles.navButton, styles.nextButton]} onPress={nextStep}>
            <Text style={styles.navButtonText}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.navButton, styles.submitButton]} onPress={handleSubmit}>
            <Ionicons name="checkmark" size={20} color="#FFF" />
            <Text style={styles.navButtonText}>Create Estimate</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Currency Picker Modal */}
      <Modal
        visible={showCurrencyPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCurrencyPicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCurrencyPicker(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Currency</Text>
              <TouchableOpacity onPress={() => setShowCurrencyPicker(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {currencies.map((currency) => (
                <TouchableOpacity
                  key={currency}
                  style={[
                    styles.modalOption,
                    formData.currency === currency && styles.modalOptionSelected
                  ]}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, currency }));
                    setShowCurrencyPicker(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{currency}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Job Category Picker Modal */}
      <Modal
        visible={showCategoryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCategoryPicker(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Job Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {jobCategories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.modalOption,
                    formData.job_category === category && styles.modalOptionSelected
                  ]}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, job_category: category }));
                    setShowCategoryPicker(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{category}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Workmanship Type Picker Modal */}
      <Modal
        visible={showWorkmanshipPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowWorkmanshipPicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowWorkmanshipPicker(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Workmanship Type</Text>
              <TouchableOpacity onPress={() => setShowWorkmanshipPicker(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {workmanshipTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.modalOption,
                    laborForm.service_description === type && styles.modalOptionSelected
                  ]}
                  onPress={() => {
                    setLaborForm(prev => ({ ...prev, service_description: type }));
                    setShowWorkmanshipPicker(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{type}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDatePicker(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Valid Until Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {[7, 14, 30, 60, 90].map((days) => {
                const date = new Date();
                date.setDate(date.getDate() + days);
                const dateString = date.toISOString().split('T')[0];
                return (
                  <TouchableOpacity
                    key={days}
                    style={[
                      styles.modalOption,
                      formData.valid_until === dateString && styles.modalOptionSelected
                    ]}
                    onPress={() => {
                      setFormData(prev => ({ ...prev, valid_until: dateString }));
                      setCustomDate(dateString);
                      setShowDatePicker(false);
                    }}
                  >
                    <Text style={styles.modalOptionText}>
                      {days} days ({date.toLocaleDateString()})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Payment Methods Picker Modal */}
      <Modal
        visible={showPaymentMethodsPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaymentMethodsPicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPaymentMethodsPicker(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Payment Methods</Text>
              <TouchableOpacity onPress={() => setShowPaymentMethodsPicker(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {paymentMethods.map((method) => (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.modalOption,
                    formData.payment_methods === method && styles.modalOptionSelected
                  ]}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, payment_methods: method }));
                    setShowPaymentMethodsPicker(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{method}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  progressStepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDotActive: {
    backgroundColor: '#FF8C00',
  },
  progressDotText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  progressLine: {
    width: 30,
    height: 2,
    backgroundColor: '#2A2A2A',
  },
  progressLineActive: {
    backgroundColor: '#FF8C00',
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#B0B0B0',
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF8C00',
    marginTop: 16,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#FFF',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginBottom: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  halfInput: {
    flex: 1,
  },
  smallInput: {
    flex: 1,
  },
  addItemForm: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginBottom: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF8C00',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  itemCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginBottom: 8,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    flex: 1,
  },
  itemDescription: {
    fontSize: 14,
    color: '#B0B0B0',
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemDetails: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF8C00',
  },
  rateTypeRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  rateTypeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#2A2A2A',
    borderRadius: 6,
  },
  rateTypeButtonActive: {
    backgroundColor: '#FF8C00',
  },
  rateTypeText: {
    fontSize: 14,
    color: '#B0B0B0',
    textAlign: 'center',
  },
  rateTypeTextActive: {
    color: '#FFF',
  },
  summaryCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  summaryDivider: {
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    paddingTop: 12,
    marginTop: 6,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#B0B0B0',
  },
  summaryValue: {
    fontSize: 16,
    color: '#FFF',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    paddingTop: 12,
    marginTop: 6,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF8C00',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    gap: 12,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A2A2A',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
    flex: 1,
  },
  nextButton: {
    backgroundColor: '#FF8C00',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  scrollContentContainer: {
    paddingBottom: 100,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B0B0B0',
    marginBottom: 8,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    marginBottom: 12,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#666',
  },
  pickerButtonTextSelected: {
    fontSize: 16,
    color: '#FFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  modalOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#FFF',
  },
  modalOptionSelected: {
    backgroundColor: '#2A2A2A',
  },
});
