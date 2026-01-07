import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { updateEstimate, getEstimateById } from '../../../services/estimateService';
import { MaterialItem, LaborItem, AdditionalCharge, EstimateFormData } from '../../../types/estimate';

const CURRENCY_OPTIONS = ['LRD', 'USD', 'EUR', 'GBP'];
const JOB_CATEGORIES = [
  'Construction',
  'Electrical',
  'Plumbing',
  'Carpentry',
  'Painting',
  'Roofing',
  'HVAC',
  'Landscaping',
  'Renovation',
  'Other',
];

const WORKMANSHIP_TYPES = ['Installation', 'Repair', 'Maintenance', 'Renovation', 'Construction', 'Assembly', 'Custom Work', 'Consultation'];

export default function EditEstimateScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showJobCategoryPicker, setShowJobCategoryPicker] = useState(false);
  const [showWorkmanshipPicker, setShowWorkmanshipPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [formData, setFormData] = useState<EstimateFormData>({
    project_name: '',
    project_description: '',
    job_category: '',
    job_location: '',
    start_date: '',
    completion_date: '',
    client_name: '',
    client_company: '',
    client_phone: '',
    client_email: '',
    client_address: '',
    worker_name: '',
    worker_contact_person: '',
    worker_phone: '',
    worker_email: '',
    worker_address: '',
    materials: [],
    labor: [],
    additional_charges: [],
    discount_amount: 0,
    tax_rate: 0,
    payment_terms: '',
    payment_methods: '',
    deposit_amount: 0,
    notes: '',
    terms_conditions: '',
    warranty_info: '',
    valid_until: '',
    currency: 'LRD',
  });

  const loadEstimate = React.useCallback(async () => {
    try {
      setLoading(true);
      const estimate = await getEstimateById(id as string);
      
      setFormData({
        project_name: estimate.project_name || '',
        project_description: estimate.project_description || '',
        job_category: estimate.job_category || '',
        job_location: estimate.job_location || '',
        start_date: estimate.start_date || '',
        completion_date: estimate.completion_date || '',
        client_name: estimate.client_name || '',
        client_company: estimate.client_company || '',
        client_phone: estimate.client_phone || '',
        client_email: estimate.client_email || '',
        client_address: estimate.client_address || '',
        worker_name: estimate.worker_name || '',
        worker_contact_person: estimate.worker_contact_person || '',
        worker_phone: estimate.worker_phone || '',
        worker_email: estimate.worker_email || '',
        worker_address: estimate.worker_address || '',
        materials: estimate.materials || [],
        labor: estimate.labor || [],
        additional_charges: estimate.additional_charges || [],
        discount_amount: estimate.discount_amount || 0,
        tax_rate: estimate.tax_rate || 0,
        payment_terms: estimate.payment_terms || '',
        payment_methods: estimate.payment_methods || '',
        deposit_amount: estimate.deposit_amount || 0,
        notes: estimate.notes || '',
        terms_conditions: estimate.terms_conditions || '',
        warranty_info: estimate.warranty_info || '',
        valid_until: estimate.valid_until || '',
        currency: estimate.currency || 'LRD',
      });
    } catch (error) {
      console.error('Error loading estimate:', error);
      Alert.alert('Error', 'Failed to load estimate');
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id, getEstimateById, router]);

  useEffect(() => {
    loadEstimate();
  }, [loadEstimate]);

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.project_name.trim()) {
          Alert.alert('Validation Error', 'Project name is required');
          return false;
        }
        return true;
      case 2:
        if (!formData.client_name.trim() || !formData.client_phone.trim()) {
          Alert.alert('Validation Error', 'Client name and phone are required');
          return false;
        }
        return true;
      case 3:
        if (!formData.worker_name.trim() || !formData.worker_phone.trim()) {
          Alert.alert('Validation Error', 'Worker name and phone are required');
          return false;
        }
        return true;
      case 4:
      case 5:
      case 6:
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(6)) return;

    try {
      await updateEstimate(id as string, formData);
      Alert.alert('Success', 'Estimate updated successfully', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Failed to update estimate. Please try again.');
    }
  };

  const addMaterial = () => {
    const newMaterial: MaterialItem = {
      id: Date.now().toString(),
      item_name: '',
      description: '',
      quantity: 0,
      unit: '',
      unit_price: 0,
      total: 0,
    };
    setFormData(prev => ({ ...prev, materials: [...prev.materials, newMaterial] }));
  };

  const updateMaterial = (index: number, field: keyof MaterialItem, value: any) => {
    const updatedMaterials = [...formData.materials];
    updatedMaterials[index] = { ...updatedMaterials[index], [field]: value };
    
    if (field === 'quantity' || field === 'unit_price') {
      const quantity = field === 'quantity' ? parseFloat(value) || 0 : updatedMaterials[index].quantity;
      const unitPrice = field === 'unit_price' ? parseFloat(value) || 0 : updatedMaterials[index].unit_price;
      updatedMaterials[index].total = quantity * unitPrice;
    }
    
    setFormData(prev => ({ ...prev, materials: updatedMaterials }));
  };

  const removeMaterial = (index: number) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index)
    }));
  };

  const addLabor = () => {
    const newLabor: LaborItem = {
      id: Date.now().toString(),
      service_description: '',
      labor_rate: 0,
      rate_type: 'fixed',
      hours_days: 0,
      total: 0,
    };
    setFormData(prev => ({ ...prev, labor: [...prev.labor, newLabor] }));
  };

  const updateLabor = (index: number, field: keyof LaborItem, value: any) => {
    const updatedLabor = [...formData.labor];
    updatedLabor[index] = { ...updatedLabor[index], [field]: value };
    
    if (field === 'labor_rate' || field === 'hours_days' || field === 'rate_type') {
      if (updatedLabor[index].rate_type === 'fixed') {
        updatedLabor[index].total = parseFloat(updatedLabor[index].labor_rate.toString()) || 0;
      } else {
        const rate = parseFloat(updatedLabor[index].labor_rate.toString()) || 0;
        const hours = parseFloat(updatedLabor[index].hours_days?.toString() || '0') || 0;
        updatedLabor[index].total = rate * hours;
      }
    }
    
    setFormData(prev => ({ ...prev, labor: updatedLabor }));
  };

  const removeLabor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      labor: prev.labor.filter((_, i) => i !== index)
    }));
  };

  const addCharge = () => {
    const newCharge: AdditionalCharge = {
      id: Date.now().toString(),
      description: '',
      amount: 0,
    };
    setFormData(prev => ({ ...prev, additional_charges: [...prev.additional_charges, newCharge] }));
  };

  const updateCharge = (index: number, field: keyof AdditionalCharge, value: any) => {
    const updatedCharges = [...formData.additional_charges];
    updatedCharges[index] = { ...updatedCharges[index], [field]: value };
    setFormData(prev => ({ ...prev, additional_charges: updatedCharges }));
  };

  const removeCharge = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additional_charges: prev.additional_charges.filter((_, i) => i !== index)
    }));
  };

  const calculateTotals = () => {
    const materialsTotal = formData.materials.reduce((sum, item) => sum + (item.total || 0), 0);
    const laborTotal = formData.labor.reduce((sum, item) => sum + (item.total || 0), 0);
    const chargesTotal = formData.additional_charges.reduce((sum, item) => sum + (item.amount || 0), 0);
    const subtotal = materialsTotal + laborTotal + chargesTotal;
    const discountAmount = formData.discount_amount || 0;
    const taxAmount = (subtotal - discountAmount) * (formData.tax_rate / 100);
    const total = subtotal - discountAmount + taxAmount;
    const depositAmount = formData.deposit_amount || 0;
    const balanceDue = total - depositAmount;

    return {
      materialsTotal,
      laborTotal,
      chargesTotal,
      subtotal,
      taxAmount,
      total,
      balanceDue,
    };
  };

  const totals = calculateTotals();

  const renderStep1 = () => (
    <ScrollView 
      style={styles.stepContent}
      contentContainerStyle={styles.scrollContentContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.stepTitle}>Project Details</Text>
      
      <Text style={styles.label}>Project Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter project name"
        placeholderTextColor="#666"
        value={formData.project_name}
        onChangeText={(text) => setFormData(prev => ({ ...prev, project_name: text }))}
      />

      <Text style={styles.label}>Project Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Describe the project scope and objectives"
        placeholderTextColor="#666"
        value={formData.project_description}
        onChangeText={(text) => setFormData(prev => ({ ...prev, project_description: text }))}
        multiline
        numberOfLines={4}
      />

      <Text style={styles.label}>Job Category</Text>
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setShowJobCategoryPicker(true)}
      >
        <Text style={[styles.pickerButtonText, !formData.job_category && styles.placeholderText]}>
          {formData.job_category || 'Select job category'}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>

      <Text style={styles.label}>Job Location</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter job site address or location"
        placeholderTextColor="#666"
        value={formData.job_location}
        onChangeText={(text) => setFormData(prev => ({ ...prev, job_location: text }))}
      />

      <Text style={styles.label}>Currency</Text>
      <TouchableOpacity
        style={styles.pickerButton}
        onPress={() => setShowCurrencyPicker(true)}
      >
        <Text style={styles.pickerButtonText}>{formData.currency}</Text>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>

      <Text style={styles.label}>Valid Until</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD (e.g., 2024-12-31)"
        placeholderTextColor="#666"
        value={formData.valid_until}
        onChangeText={(text) => setFormData(prev => ({ ...prev, valid_until: text }))}
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
      <Text style={styles.stepTitle}>Client Information</Text>
      
      <Text style={styles.label}>Client Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter client's full name"
        placeholderTextColor="#666"
        value={formData.client_name}
        onChangeText={(text) => setFormData(prev => ({ ...prev, client_name: text }))}
      />

      <Text style={styles.label}>Company Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter company name (optional)"
        placeholderTextColor="#666"
        value={formData.client_company}
        onChangeText={(text) => setFormData(prev => ({ ...prev, client_company: text }))}
      />

      <Text style={styles.label}>Phone Number *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter phone number"
        placeholderTextColor="#666"
        value={formData.client_phone}
        onChangeText={(text) => setFormData(prev => ({ ...prev, client_phone: text }))}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Email Address</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter email address (optional)"
        placeholderTextColor="#666"
        value={formData.client_email}
        onChangeText={(text) => setFormData(prev => ({ ...prev, client_email: text }))}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Address</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Enter full address (optional)"
        placeholderTextColor="#666"
        value={formData.client_address}
        onChangeText={(text) => setFormData(prev => ({ ...prev, client_address: text }))}
        multiline
        numberOfLines={3}
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
      <Text style={styles.stepTitle}>Worker / Business Information</Text>
      
      <Text style={styles.label}>Business/Worker Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your business or worker name"
        placeholderTextColor="#666"
        value={formData.worker_name}
        onChangeText={(text) => setFormData(prev => ({ ...prev, worker_name: text }))}
      />

      <Text style={styles.label}>Contact Person</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter contact person name (optional)"
        placeholderTextColor="#666"
        value={formData.worker_contact_person}
        onChangeText={(text) => setFormData(prev => ({ ...prev, worker_contact_person: text }))}
      />

      <Text style={styles.label}>Phone Number *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter phone number"
        placeholderTextColor="#666"
        value={formData.worker_phone}
        onChangeText={(text) => setFormData(prev => ({ ...prev, worker_phone: text }))}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Email Address</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter email address (optional)"
        placeholderTextColor="#666"
        value={formData.worker_email}
        onChangeText={(text) => setFormData(prev => ({ ...prev, worker_email: text }))}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Business Address</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Enter business address (optional)"
        placeholderTextColor="#666"
        value={formData.worker_address}
        onChangeText={(text) => setFormData(prev => ({ ...prev, worker_address: text }))}
        multiline
        numberOfLines={3}
      />
    </ScrollView>
  );

  const renderStep4 = () => (
    <ScrollView 
      style={styles.stepContent}
      contentContainerStyle={styles.scrollContentContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Materials</Text>
        <TouchableOpacity style={styles.addButton} onPress={addMaterial}>
          <Ionicons name="add-circle" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {formData.materials.map((material, index) => (
        <View key={material.id} style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemNumber}>Material {index + 1}</Text>
            <TouchableOpacity onPress={() => removeMaterial(index)}>
              <Ionicons name="trash" size={20} color="#F44336" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Item name"
            placeholderTextColor="#666"
            value={material.item_name}
            onChangeText={(text) => updateMaterial(index, 'item_name', text)}
          />

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description (optional)"
            placeholderTextColor="#666"
            value={material.description}
            onChangeText={(text) => updateMaterial(index, 'description', text)}
            multiline
            numberOfLines={2}
          />

          <View style={styles.row}>
            <View style={styles.flex1}>
              <TextInput
                style={styles.input}
                placeholder={`Quantity`}
                placeholderTextColor="#666"
                value={material.quantity?.toString()}
                onChangeText={(text) => updateMaterial(index, 'quantity', text)}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.flex1}>
              <TextInput
                style={styles.input}
                placeholder="Unit (e.g., pcs, kg)"
                placeholderTextColor="#666"
                value={material.unit}
                onChangeText={(text) => updateMaterial(index, 'unit', text)}
              />
            </View>
          </View>

          <TextInput
            style={styles.input}
            placeholder={`Unit price (${formData.currency})`}
            placeholderTextColor="#666"
            value={material.unit_price?.toString()}
            onChangeText={(text) => updateMaterial(index, 'unit_price', text)}
            keyboardType="numeric"
          />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>{formData.currency} {material.total.toFixed(2)}</Text>
          </View>
        </View>
      ))}

      {formData.materials.length === 0 && (
        <Text style={styles.emptyText}>No materials added yet. Tap + to add materials.</Text>
      )}
    </ScrollView>
  );

  const renderStep5 = () => (
    <ScrollView 
      style={styles.stepContent}
      contentContainerStyle={styles.scrollContentContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Labor / Workmanship</Text>
        <TouchableOpacity style={styles.addButton} onPress={addLabor}>
          <Ionicons name="add-circle" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {formData.labor.map((labor, index) => (
        <View key={labor.id} style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemNumber}>Service {index + 1}</Text>
            <TouchableOpacity onPress={() => removeLabor(index)}>
              <Ionicons name="trash" size={20} color="#F44336" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Workmanship Type</Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowWorkmanshipPicker(true)}
          >
            <Text style={labor.service_description ? styles.pickerButtonTextSelected : styles.pickerButtonText}>
              {labor.service_description || 'Select Workmanship Type'}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#B0B0B0" />
          </TouchableOpacity>

          <Text style={styles.label}>Rate Type</Text>
          <View style={styles.rateTypeContainer}>
            {['fixed', 'hourly', 'daily'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.rateTypeButton,
                  labor.rate_type === type && styles.rateTypeButtonActive
                ]}
                onPress={() => updateLabor(index, 'rate_type', type)}
              >
                <Text style={[
                  styles.rateTypeText,
                  labor.rate_type === type && styles.rateTypeTextActive
                ]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Rate"
            placeholderTextColor="#666"
            value={labor.labor_rate === 0 ? '' : labor.labor_rate?.toString()}
            onChangeText={(text) => updateLabor(index, 'labor_rate', text)}
            keyboardType="numeric"
          />

          {labor.rate_type !== 'fixed' && (
            <TextInput
              style={styles.input}
              placeholder={labor.rate_type === 'hourly' ? 'Number of hours' : 'Number of days'}
              placeholderTextColor="#666"
              value={labor.hours_days?.toString()}
              onChangeText={(text) => updateLabor(index, 'hours_days', text)}
              keyboardType="numeric"
            />
          )}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>{formData.currency} {labor.total.toFixed(2)}</Text>
          </View>
        </View>
      ))}

      {formData.labor.length === 0 && (
        <Text style={styles.emptyText}>No labor added yet. Tap + to add labor services.</Text>
      )}

      <View style={styles.stepHeader}>
        <Text style={styles.stepTitle}>Additional Charges</Text>
        <TouchableOpacity style={styles.addButton} onPress={addCharge}>
          <Ionicons name="add-circle" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {formData.additional_charges.map((charge, index) => (
        <View key={charge.id} style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemNumber}>Charge {index + 1}</Text>
            <TouchableOpacity onPress={() => removeCharge(index)}>
              <Ionicons name="trash" size={20} color="#F44336" />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Description (e.g., Delivery, Setup)"
            placeholderTextColor="#666"
            value={charge.description}
            onChangeText={(text) => updateCharge(index, 'description', text)}
          />

          <TextInput
            style={styles.input}
            placeholder={`Amount (${formData.currency})`}
            placeholderTextColor="#666"
            value={charge.amount?.toString()}
            onChangeText={(text) => updateCharge(index, 'amount', text)}
            keyboardType="numeric"
          />
        </View>
      ))}
    </ScrollView>
  );

  const renderStep6 = () => (
    <ScrollView 
      style={styles.stepContent}
      contentContainerStyle={styles.scrollContentContainer}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.stepTitle}>Summary & Payment Terms</Text>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Materials:</Text>
          <Text style={styles.summaryValue}>{formData.currency} {totals.materialsTotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Labor:</Text>
          <Text style={styles.summaryValue}>{formData.currency} {totals.laborTotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Additional Charges:</Text>
          <Text style={styles.summaryValue}>{formData.currency} {totals.chargesTotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal:</Text>
          <Text style={styles.summaryValue}>{formData.currency} {totals.subtotal.toFixed(2)}</Text>
        </View>
      </View>

      <Text style={styles.label}>Discount Amount ({formData.currency})</Text>
      <TextInput
        style={styles.input}
        placeholder={`Enter discount amount (${formData.currency})`}
        placeholderTextColor="#666"
        value={formData.discount_amount?.toString()}
        onChangeText={(text) => setFormData(prev => ({ ...prev, discount_amount: parseFloat(text) || 0 }))}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Tax Rate (%)</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter tax rate percentage"
        placeholderTextColor="#666"
        value={formData.tax_rate?.toString()}
        onChangeText={(text) => setFormData(prev => ({ ...prev, tax_rate: parseFloat(text) || 0 }))}
        keyboardType="numeric"
      />

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax Amount:</Text>
          <Text style={styles.summaryValue}>{formData.currency} {totals.taxAmount.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>{formData.currency} {totals.total.toFixed(2)}</Text>
        </View>
      </View>

      <Text style={styles.label}>Deposit Amount ({formData.currency})</Text>
      <TextInput
        style={styles.input}
        placeholder={`Enter deposit amount (${formData.currency})`}
        placeholderTextColor="#666"
        value={formData.deposit_amount?.toString()}
        onChangeText={(text) => setFormData(prev => ({ ...prev, deposit_amount: parseFloat(text) || 0 }))}
        keyboardType="numeric"
      />

      {(formData.deposit_amount || 0) > 0 && (
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Balance Due:</Text>
            <Text style={styles.totalValue}>{formData.currency} {totals.balanceDue.toFixed(2)}</Text>
          </View>
        </View>
      )}

      <Text style={styles.label}>Payment Terms</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="e.g., 50% upfront, 50% upon completion"
        placeholderTextColor="#666"
        value={formData.payment_terms}
        onChangeText={(text) => setFormData(prev => ({ ...prev, payment_terms: text }))}
        multiline
        numberOfLines={3}
      />

      <Text style={styles.label}>Payment Methods</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g., Cash, Bank Transfer, Mobile Money"
        placeholderTextColor="#666"
        value={formData.payment_methods}
        onChangeText={(text) => setFormData(prev => ({ ...prev, payment_methods: text }))}
      />

      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Additional notes or special instructions (optional)"
        placeholderTextColor="#666"
        value={formData.notes}
        onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
        multiline
        numberOfLines={3}
      />

      <Text style={styles.label}>Terms & Conditions</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Enter terms and conditions (optional)"
        placeholderTextColor="#666"
        value={formData.terms_conditions}
        onChangeText={(text) => setFormData(prev => ({ ...prev, terms_conditions: text }))}
        multiline
        numberOfLines={3}
      />

      <Text style={styles.label}>Warranty Information</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Enter warranty details (optional)"
        placeholderTextColor="#666"
        value={formData.warranty_info}
        onChangeText={(text) => setFormData(prev => ({ ...prev, warranty_info: text }))}
        multiline
        numberOfLines={3}
      />
    </ScrollView>
  );

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

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading estimate...</Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Estimate</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.progressContainer}>
        {[1, 2, 3, 4, 5, 6].map((step) => (
          <View key={step} style={styles.progressStep}>
            <View style={[
              styles.progressDot,
              currentStep >= step && styles.progressDotActive
            ]} />
            {step < 6 && (
              <View style={[
                styles.progressLine,
                currentStep > step && styles.progressLineActive
              ]} />
            )}
          </View>
        ))}
      </View>

      {renderCurrentStep()}

      <View style={styles.footer}>
        {currentStep < 6 ? (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Update Estimate</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={showCurrencyPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCurrencyPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Currency</Text>
              <TouchableOpacity onPress={() => setShowCurrencyPicker(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={CURRENCY_OPTIONS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, currency: item }));
                    setShowCurrencyPicker(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                  {formData.currency === item && (
                    <Ionicons name="checkmark" size={24} color="#4CAF50" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={showJobCategoryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowJobCategoryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Job Category</Text>
              <TouchableOpacity onPress={() => setShowJobCategoryPicker(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={JOB_CATEGORIES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setFormData(prev => ({ ...prev, job_category: item }));
                    setShowJobCategoryPicker(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                  {formData.job_category === item && (
                    <Ionicons name="checkmark" size={24} color="#4CAF50" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={showWorkmanshipPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowWorkmanshipPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Workmanship Type</Text>
              <TouchableOpacity onPress={() => setShowWorkmanshipPicker(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={WORKMANSHIP_TYPES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    const updatedLabor = [...formData.labor];
                    if (updatedLabor.length > 0) {
                      updatedLabor[updatedLabor.length - 1].service_description = item;
                      setFormData(prev => ({ ...prev, labor: updatedLabor }));
                    }
                    setShowWorkmanshipPicker(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Valid Until Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={[7, 14, 30, 60, 90]}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => {
                const date = new Date();
                date.setDate(date.getDate() + item);
                const dateString = date.toISOString().split('T')[0];
                return (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setFormData(prev => ({ ...prev, valid_until: dateString }));
                      setShowDatePicker(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>
                      {item} days ({date.toLocaleDateString()})
                    </Text>
                    {formData.valid_until === dateString && (
                      <Ionicons name="checkmark" size={24} color="#4CAF50" />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#B0B0B0',
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
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#000',
  },
  progressStep: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2A2A2A',
  },
  progressDotActive: {
    backgroundColor: '#4CAF50',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#2A2A2A',
    marginHorizontal: 4,
  },
  progressLineActive: {
    backgroundColor: '#4CAF50',
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 20,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addButton: {
    padding: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B0B0B0',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 12,
    color: '#FFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
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
  },
  pickerButtonText: {
    color: '#666',
    fontSize: 16,
  },
  pickerButtonTextSelected: {
    color: '#FFF',
    fontSize: 16,
  },
  placeholderText: {
    color: '#666',
  },
  itemCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#B0B0B0',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginTop: 20,
  },
  rateTypeContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  rateTypeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    alignItems: 'center',
  },
  rateTypeButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  rateTypeText: {
    color: '#B0B0B0',
    fontSize: 14,
    fontWeight: '600',
  },
  rateTypeTextActive: {
    color: '#FFF',
  },
  summaryCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    backgroundColor: '#000',
  },
  nextButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
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
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  modalItemText: {
    fontSize: 16,
    color: '#FFF',
  },
});
