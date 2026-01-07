import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEstimate } from '../../contexts/EstimateContext';
import { Estimate } from '../../types/estimate';
import { shareEstimatePDF } from '../../utils/estimatePdfGenerator';

export default function EstimateDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getEstimateById, updateEstimate, deleteEstimate } = useEstimate();
  
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    loadEstimate();
  }, [id]);

  useFocusEffect(
    React.useCallback(() => {
      loadEstimate();
    }, [id])
  );

  const loadEstimate = () => {
    const estimateData = getEstimateById(id);
    if (estimateData) {
      setEstimate(estimateData);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return '#666';
      case 'sent': return '#FF8C00';
      case 'accepted': return '#4CAF50';
      case 'rejected': return '#F44336';
      case 'expired': return '#9E9E9E';
      default: return '#666';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const updateStatus = async (newStatus: Estimate['status']) => {
    if (!estimate) return;
    
    try {
      await updateEstimate(estimate.id, { status: newStatus });
      setEstimate(prev => prev ? { ...prev, status: newStatus } : null);
      Alert.alert('Success', `Estimate marked as ${getStatusText(newStatus)}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Estimate',
      'Are you sure you want to delete this estimate?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!estimate) return;
            try {
              await deleteEstimate(estimate.id);
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete estimate');
            }
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    if (!estimate) return;
    
    setGeneratingPDF(true);
    try {
      await shareEstimatePDF(estimate);
    } catch (error) {
      console.error('PDF sharing error:', error);
      Alert.alert('Error', 'Failed to generate or share PDF. Please try again.');
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Estimate Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (!estimate) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Estimate Details</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Estimate not found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Estimate #{estimate.estimate_number}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => router.push(`/estimate-hub/edit/${estimate.id}`)} style={styles.headerButton}>
            <Ionicons name="create-outline" size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} disabled={generatingPDF} style={styles.headerButton}>
            {generatingPDF ? (
              <ActivityIndicator size="small" color="#4CAF50" />
            ) : (
              <Ionicons name="share-outline" size={24} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Status and Actions */}
        <View style={styles.statusSection}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(estimate.status) }]}>
            <Text style={styles.statusText}>{getStatusText(estimate.status)}</Text>
          </View>
          
          <View style={styles.actionButtons}>
            {estimate.status === 'draft' && (
              <TouchableOpacity
                style={[styles.actionButton, styles.sentButton]}
                onPress={() => updateStatus('sent')}
              >
                <Text style={styles.actionButtonText}>Mark as Sent</Text>
              </TouchableOpacity>
            )}
            
            {estimate.status === 'sent' && (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, styles.acceptedButton]}
                  onPress={() => updateStatus('accepted')}
                >
                  <Text style={styles.actionButtonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectedButton]}
                  onPress={() => updateStatus('rejected')}
                >
                  <Text style={styles.actionButtonText}>Reject</Text>
                </TouchableOpacity>
              </>
            )}
            
            <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDelete}>
              <Ionicons name="trash" size={16} color="#FFF" />
              <Text style={styles.actionButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Project Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Project Information</Text>
          
          {estimate.project_name && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Project:</Text>
              <Text style={styles.infoValue}>{estimate.project_name}</Text>
            </View>
          )}
          
          {estimate.project_description && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Description:</Text>
              <Text style={styles.infoValue}>{estimate.project_description}</Text>
            </View>
          )}
          
          {estimate.job_category && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Category:</Text>
              <Text style={styles.infoValue}>{estimate.job_category}</Text>
            </View>
          )}
          
          {estimate.job_location && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Location:</Text>
              <Text style={styles.infoValue}>{estimate.job_location}</Text>
            </View>
          )}
          
          {estimate.estimate_date && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Created:</Text>
              <Text style={styles.infoValue}>{new Date(estimate.estimate_date).toLocaleDateString()}</Text>
            </View>
          )}
          
          {estimate.valid_until && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Valid Until:</Text>
              <Text style={styles.infoValue}>{new Date(estimate.valid_until).toLocaleDateString()}</Text>
            </View>
          )}
        </View>

        {/* Client Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client Information</Text>
          
          {estimate.client_name && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{estimate.client_name}</Text>
            </View>
          )}
          
          {estimate.client_company && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Company:</Text>
              <Text style={styles.infoValue}>{estimate.client_company}</Text>
            </View>
          )}
          
          {estimate.client_phone && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={styles.infoValue}>{estimate.client_phone}</Text>
            </View>
          )}
          
          {estimate.client_email && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{estimate.client_email}</Text>
            </View>
          )}
          
          {estimate.client_address && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address:</Text>
              <Text style={styles.infoValue}>{estimate.client_address}</Text>
            </View>
          )}
        </View>

        {/* Worker Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Worker / Business</Text>
          
          {estimate.worker_name && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{estimate.worker_name}</Text>
            </View>
          )}
          
          {estimate.worker_phone && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={styles.infoValue}>{estimate.worker_phone}</Text>
            </View>
          )}
          
          {estimate.worker_email && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{estimate.worker_email}</Text>
            </View>
          )}
          
          {estimate.worker_address && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address:</Text>
              <Text style={styles.infoValue}>{estimate.worker_address}</Text>
            </View>
          )}
        </View>

        {/* Materials */}
        {estimate.materials.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Materials</Text>
            
            {estimate.materials.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{item.item_name || 'Unnamed Item'}</Text>
                  <Text style={styles.itemCost}>{estimate.currency || 'LRD'} {(item.total || 0).toFixed(2)}</Text>
                </View>
                {item.description && <Text style={styles.itemDescription}>{item.description}</Text>}
                <Text style={styles.itemQuantity}>
                  {item.quantity || 0} {item.unit || 'unit'} × {estimate.currency || 'LRD'} {(item.unit_price || 0).toFixed(2)}
                </Text>
              </View>
            ))}
            
            <View style={styles.subtotalRow}>
              <Text style={styles.subtotalLabel}>Materials Subtotal:</Text>
              <Text style={styles.subtotalValue}>{estimate.currency || 'LRD'} {(estimate.materials_subtotal || 0).toFixed(2)}</Text>
            </View>
          </View>
        )}

        {/* Labor */}
        {estimate.labor.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Labor / Workmanship</Text>
            
            {estimate.labor.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{item.service_description || 'Unnamed Service'}</Text>
                  <Text style={styles.itemCost}>{estimate.currency || 'LRD'} {(item.total || 0).toFixed(2)}</Text>
                </View>
                <Text style={styles.itemQuantity}>
                  {item.rate_type === 'fixed' 
                    ? 'Fixed Rate' 
                    : `${item.hours_days || 0} ${item.rate_type === 'hourly' ? 'hours' : 'days'} × ${estimate.currency || 'LRD'} ${(item.labor_rate || 0).toFixed(2)}`
                  }
                </Text>
              </View>
            ))}
            
            <View style={styles.subtotalRow}>
              <Text style={styles.subtotalLabel}>Labor Subtotal:</Text>
              <Text style={styles.subtotalValue}>{estimate.currency || 'LRD'} {(estimate.labor_subtotal || 0).toFixed(2)}</Text>
            </View>
          </View>
        )}

        {/* Additional Charges */}
        {estimate.additional_charges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Charges</Text>
            
            {estimate.additional_charges.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{item.description || 'Additional Charge'}</Text>
                  <Text style={styles.itemCost}>{estimate.currency || 'LRD'} {(item.amount || 0).toFixed(2)}</Text>
                </View>
              </View>
            ))}
            
            <View style={styles.subtotalRow}>
              <Text style={styles.subtotalLabel}>Additional Charges:</Text>
              <Text style={styles.subtotalValue}>{estimate.currency || 'LRD'} {(estimate.additional_charges_subtotal || 0).toFixed(2)}</Text>
            </View>
          </View>
        )}

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cost Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>
              {estimate.currency || 'LRD'} {((estimate.materials_subtotal || 0) + (estimate.labor_subtotal || 0) + (estimate.additional_charges_subtotal || 0)).toFixed(2)}
            </Text>
          </View>
          
          {(estimate.discount_amount || 0) > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount:</Text>
              <Text style={styles.summaryValue}>-{estimate.currency || 'LRD'} {(estimate.discount_amount || 0).toFixed(2)}</Text>
            </View>
          )}
          
          {(estimate.tax_rate || 0) > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax ({estimate.tax_rate || 0}%):</Text>
              <Text style={styles.summaryValue}>{estimate.currency || 'LRD'} {(estimate.tax_amount || 0).toFixed(2)}</Text>
            </View>
          )}
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>{estimate.currency || 'LRD'} {(estimate.total_cost || 0).toFixed(2)}</Text>
          </View>
          
          {(estimate.deposit_amount || 0) > 0 && (
            <>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Deposit:</Text>
                <Text style={styles.summaryValue}>-{estimate.currency || 'LRD'} {(estimate.deposit_amount || 0).toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Balance Due:</Text>
                <Text style={styles.totalValue}>{estimate.currency || 'LRD'} {(estimate.balance_due || 0).toFixed(2)}</Text>
              </View>
            </>
          )}
        </View>

        {/* Payment Information */}
        {(estimate.payment_terms || estimate.payment_methods) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Information</Text>
            {estimate.payment_terms && <Text style={styles.termsText}>{estimate.payment_terms}</Text>}
            {estimate.payment_methods && <Text style={styles.termsText}>Payment Methods: {estimate.payment_methods}</Text>}
          </View>
        )}

        {/* Notes & Terms */}
        {estimate.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{estimate.notes}</Text>
          </View>
        )}
        
        {estimate.terms_conditions && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Terms & Conditions</Text>
            <Text style={styles.termsText}>{estimate.terms_conditions}</Text>
          </View>
        )}
        
        {estimate.warranty_info && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Warranty</Text>
            <Text style={styles.termsText}>{estimate.warranty_info}</Text>
          </View>
        )}
      </ScrollView>
    </View>
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
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  headerButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
  },
  statusSection: {
    marginBottom: 24,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 1,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 1,
    gap: 4,
  },
  sentButton: {
    backgroundColor: '#FF8C00',
  },
  acceptedButton: {
    backgroundColor: '#4CAF50',
  },
  rejectedButton: {
    backgroundColor: '#F44336',
  },
  deleteButton: {
    backgroundColor: '#666',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 16,
    color: '#B0B0B0',
    width: 100,
  },
  infoValue: {
    fontSize: 16,
    color: '#FFF',
    flex: 1,
  },
  itemCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 1,
    padding: 12,
    borderWidth: 0,
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
  itemCost: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF8C00',
  },
  itemDescription: {
    fontSize: 14,
    color: '#B0B0B0',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  subtotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  subtotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  subtotalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF8C00',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
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
    marginTop: 8,
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
  termsText: {
    fontSize: 16,
    color: '#B0B0B0',
    lineHeight: 24,
    marginBottom: 8,
  },
  notesText: {
    fontSize: 16,
    color: '#B0B0B0',
    lineHeight: 24,
  },
});
