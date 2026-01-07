import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Estimate } from '../types/estimate';

export const generateEstimatePDF = async (estimate: Estimate) => {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background: #000;
      color: #FFF;
      padding: 40px;
      font-size: 14px;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      border-bottom: 3px solid #FF8C00;
      padding-bottom: 20px;
    }
    
    .header h1 {
      color: #FF8C00;
      font-size: 32px;
      margin-bottom: 10px;
      font-weight: 700;
    }
    
    .header .estimate-number {
      font-size: 18px;
      color: #B0B0B0;
      margin-bottom: 5px;
    }
    
    .header .estimate-date {
      font-size: 14px;
      color: #888;
    }
    
    .status-badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 0px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 10px;
      text-transform: uppercase;
    }
    
    .status-draft { background: #666; }
    .status-sent { background: #FF8C00; }
    .status-accepted { background: #4CAF50; }
    .status-rejected { background: #F44336; }
    
    .section {
      background: #1A1A1A;
      border-radius: 1px;
      padding: 20px;
      margin-bottom: 20px;
      border: 1px solid #000000ff;
    }
    
    .section-title {
      color: #FF8C00;
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 15px;
      border-bottom: 2px solid #464646ff;
      padding-bottom: 10px;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }
    
    .info-row {
      margin-bottom: 12px;
    }
    
    .info-label {
      color: #888;
      font-size: 12px;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .info-value {
      color: #FFF;
      font-size: 14px;
      font-weight: 500;
    }
    
    .item-card {
      background: #000000ff;
      border: 0px solid #212121ff;
      border-radius: 1px;
      padding: 15px;
      margin-bottom: 12px;
    }
    
    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    
    .item-name {
      color: #FFF;
      font-size: 16px;
      font-weight: 600;
    }
    
    .item-cost {
      color: #FF8C00;
      font-size: 16px;
      font-weight: 700;
    }
    
    .item-description {
      color: #B0B0B0;
      font-size: 13px;
      margin-bottom: 8px;
    }
    
    .item-quantity {
      color: #888;
      font-size: 13px;
    }
    
    .subtotal-row {
      display: flex;
      justify-content: space-between;
      padding: 15px;
      background: #0A0A0A;
      border-radius: 2px;
      margin-top: 10px;
    }
    
    .subtotal-label {
      color: #B0B0B0;
      font-size: 14px;
      font-weight: 600;
    }
    
    .subtotal-value {
      color: #FFF;
      font-size: 14px;
      font-weight: 700;
    }
    
    .summary-card {
      background: #000000ff;
      border: 0px solid #000000ff;
      border-radius: 12px;
      padding: 20px;
    }
    
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 0px solid #2A2A2A;
    }
    
    .summary-row:last-child {
      border-bottom: none;
    }
    
    .summary-label {
      color: #B0B0B0;
      font-size: 14px;
    }
    
    .summary-value {
      color: #FFF;
      font-size: 14px;
      font-weight: 600;
    }
    
    .total-row {
      background: #067e00ff;
      margin: -20px;
      margin-top: 15px;
      padding: 20px;
      border-radius: 0 0 12px 12px;
    }
    
    .total-label {
      color: #FFF;
      font-size: 18px;
      font-weight: 700;
    }
    
    .total-value {
      color: #FFF;
      font-size: 24px;
      font-weight: 700;
    }
    
    .notes-section {
      background: #1A1A1A;
      border-left: 0px solid #4CAF50;
      padding: 15px;
      margin-top: 10px;
      border-radius: 0px;
    }
    
    .notes-title {
      color: #FF8C00;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .notes-text {
      color: #B0B0B0;
      font-size: 13px;
      line-height: 1.6;
      white-space: pre-wrap;
    }
    
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #2A2A2A;
      color: #666;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>ESTIMATE</h1>
    <div class="estimate-number">#${estimate.estimate_number}</div>
    <div class="estimate-date">Date: ${new Date(estimate.estimate_date).toLocaleDateString()}</div>
    ${estimate.valid_until ? `<div class="estimate-date">Valid Until: ${new Date(estimate.valid_until).toLocaleDateString()}</div>` : ''}
    <span class="status-badge status-${estimate.status}">${estimate.status.toUpperCase()}</span>
  </div>

  <!-- Project Information -->
  <div class="section">
    <div class="section-title">Project Information</div>
    <div class="info-grid">
      <div class="info-row">
        <div class="info-label">Project Name</div>
        <div class="info-value">${estimate.project_name}</div>
      </div>
      ${estimate.job_category ? `
      <div class="info-row">
        <div class="info-label">Category</div>
        <div class="info-value">${estimate.job_category}</div>
      </div>
      ` : ''}
      ${estimate.job_location ? `
      <div class="info-row">
        <div class="info-label">Location</div>
        <div class="info-value">${estimate.job_location}</div>
      </div>
      ` : ''}
    </div>
    ${estimate.project_description ? `
    <div class="info-row" style="margin-top: 15px;">
      <div class="info-label">Description</div>
      <div class="info-value">${estimate.project_description}</div>
    </div>
    ` : ''}
  </div>

  <!-- Client Information -->
  <div class="section">
    <div class="section-title">Client Information</div>
    <div class="info-grid">
      <div class="info-row">
        <div class="info-label">Name</div>
        <div class="info-value">${estimate.client_name}</div>
      </div>
      ${estimate.client_company ? `
      <div class="info-row">
        <div class="info-label">Company</div>
        <div class="info-value">${estimate.client_company}</div>
      </div>
      ` : ''}
      <div class="info-row">
        <div class="info-label">Phone</div>
        <div class="info-value">${estimate.client_phone}</div>
      </div>
      ${estimate.client_email ? `
      <div class="info-row">
        <div class="info-label">Email</div>
        <div class="info-value">${estimate.client_email}</div>
      </div>
      ` : ''}
    </div>
    ${estimate.client_address ? `
    <div class="info-row" style="margin-top: 15px;">
      <div class="info-label">Address</div>
      <div class="info-value">${estimate.client_address}</div>
    </div>
    ` : ''}
  </div>

  <!-- Worker Information -->
  <div class="section">
    <div class="section-title">Worker / Business Information</div>
    <div class="info-grid">
      ${estimate.worker_name ? `
      <div class="info-row">
        <div class="info-label">Business Name</div>
        <div class="info-value">${estimate.worker_name}</div>
      </div>
      ` : ''}
      ${estimate.worker_contact_person ? `
      <div class="info-row">
        <div class="info-label">Contact Person</div>
        <div class="info-value">${estimate.worker_contact_person}</div>
      </div>
      ` : ''}
      ${estimate.worker_phone ? `
      <div class="info-row">
        <div class="info-label">Phone</div>
        <div class="info-value">${estimate.worker_phone}</div>
      </div>
      ` : ''}
      ${estimate.worker_email ? `
      <div class="info-row">
        <div class="info-label">Email</div>
        <div class="info-value">${estimate.worker_email}</div>
      </div>
      ` : ''}
    </div>
    ${estimate.worker_address ? `
    <div class="info-row" style="margin-top: 15px;">
      <div class="info-label">Address</div>
      <div class="info-value">${estimate.worker_address}</div>
    </div>
    ` : ''}
  </div>

  <!-- Materials -->
  ${estimate.materials && estimate.materials.length > 0 ? `
  <div class="section">
    <div class="section-title">Materials</div>
    ${estimate.materials.map(item => `
      <div class="item-card">
        <div class="item-header">
          <div class="item-name">${item.item_name}</div>
          <div class="item-cost">${estimate.currency} ${item.total.toFixed(2)}</div>
        </div>
        ${item.description ? `<div class="item-description">${item.description}</div>` : ''}
        <div class="item-quantity">${item.quantity} ${item.unit} × ${estimate.currency} ${item.unit_price.toFixed(2)}</div>
      </div>
    `).join('')}
    <div class="subtotal-row">
      <div class="subtotal-label">Materials Subtotal:</div>
      <div class="subtotal-value">${estimate.currency} ${estimate.materials_subtotal.toFixed(2)}</div>
    </div>
  </div>
  ` : ''}

  <!-- Labor -->
  ${estimate.labor && estimate.labor.length > 0 ? `
  <div class="section">
    <div class="section-title">Labor / Workmanship</div>
    ${estimate.labor.map(item => `
      <div class="item-card">
        <div class="item-header">
          <div class="item-name">${item.service_description}</div>
          <div class="item-cost">${estimate.currency} ${item.total.toFixed(2)}</div>
        </div>
        <div class="item-quantity">
          ${item.rate_type === 'fixed' ? 'Fixed Rate' : `${item.hours_days} ${item.rate_type === 'hourly' ? 'hours' : 'days'} × ${estimate.currency} ${item.labor_rate.toFixed(2)}`}
        </div>
      </div>
    `).join('')}
    <div class="subtotal-row">
      <div class="subtotal-label">Labor Subtotal:</div>
      <div class="subtotal-value">${estimate.currency} ${estimate.labor_subtotal.toFixed(2)}</div>
    </div>
  </div>
  ` : ''}

  <!-- Additional Charges -->
  ${estimate.additional_charges && estimate.additional_charges.length > 0 ? `
  <div class="section">
    <div class="section-title">Additional Charges</div>
    ${estimate.additional_charges.map(item => `
      <div class="item-card">
        <div class="item-header">
          <div class="item-name">${item.description}</div>
          <div class="item-cost">${estimate.currency} ${item.amount.toFixed(2)}</div>
        </div>
      </div>
    `).join('')}
    <div class="subtotal-row">
      <div class="subtotal-label">Additional Charges:</div>
      <div class="subtotal-value">${estimate.currency} ${estimate.additional_charges_subtotal.toFixed(2)}</div>
    </div>
  </div>
  ` : ''}

  <!-- Summary -->
  <div class="section">
    <div class="section-title">Cost Summary</div>
    <div class="summary-card">
      <div class="summary-row">
        <div class="summary-label">Subtotal:</div>
        <div class="summary-value">${estimate.currency} ${(estimate.materials_subtotal + estimate.labor_subtotal + estimate.additional_charges_subtotal).toFixed(2)}</div>
      </div>
      ${estimate.discount_amount > 0 ? `
      <div class="summary-row">
        <div class="summary-label">Discount:</div>
        <div class="summary-value">-${estimate.currency} ${estimate.discount_amount.toFixed(2)}</div>
      </div>
      ` : ''}
      ${estimate.tax_rate > 0 ? `
      <div class="summary-row">
        <div class="summary-label">Tax (${estimate.tax_rate}%):</div>
        <div class="summary-value">${estimate.currency} ${estimate.tax_amount.toFixed(2)}</div>
      </div>
      ` : ''}
      <div class="summary-row total-row">
        <div class="total-label">TOTAL:</div>
        <div class="total-value">${estimate.currency} ${estimate.total_cost.toFixed(2)}</div>
      </div>
    </div>
  </div>

  <!-- Payment Information -->
  ${estimate.payment_terms || estimate.payment_methods || (estimate.deposit_amount && estimate.deposit_amount > 0) ? `
  <div class="section">
    <div class="section-title">Payment Information</div>
    ${estimate.payment_terms ? `
    <div class="notes-section">
      <div class="notes-title">Payment Terms</div>
      <div class="notes-text">${estimate.payment_terms}</div>
    </div>
    ` : ''}
    ${estimate.payment_methods ? `
    <div class="notes-section">
      <div class="notes-title">Payment Methods</div>
      <div class="notes-text">${estimate.payment_methods}</div>
    </div>
    ` : ''}
    ${estimate.deposit_amount && estimate.deposit_amount > 0 ? `
    <div class="summary-card" style="margin-top: 15px;">
      <div class="summary-row">
        <div class="summary-label">Deposit Required:</div>
        <div class="summary-value">${estimate.currency} ${estimate.deposit_amount.toFixed(2)}</div>
      </div>
      <div class="summary-row">
        <div class="summary-label">Balance Due:</div>
        <div class="total-value">${estimate.currency} ${estimate.balance_due.toFixed(2)}</div>
      </div>
    </div>
    ` : ''}
  </div>
  ` : ''}

  <!-- Notes & Terms -->
  ${estimate.notes || estimate.terms_conditions || estimate.warranty_info ? `
  <div class="section">
    <div class="section-title">Additional Information</div>
    ${estimate.notes ? `
    <div class="notes-section">
      <div class="notes-title">Notes</div>
      <div class="notes-text">${estimate.notes}</div>
    </div>
    ` : ''}
    ${estimate.terms_conditions ? `
    <div class="notes-section">
      <div class="notes-title">Terms & Conditions</div>
      <div class="notes-text">${estimate.terms_conditions}</div>
    </div>
    ` : ''}
    ${estimate.warranty_info ? `
    <div class="notes-section">
      <div class="notes-title">Warranty Information</div>
      <div class="notes-text">${estimate.warranty_info}</div>
    </div>
    ` : ''}
  </div>
  ` : ''}

  <div class="footer">
    Generated by TrackMate - Professional Estimate Management<br>
    ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
  </div>
</body>
</html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html });
    return uri;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
};

export const shareEstimatePDF = async (estimate: Estimate) => {
  try {
    const pdfUri = await generateEstimatePDF(estimate);
    
    // Use project name as filename
    const filename = `${estimate.project_name.replace(/[^a-z0-9]/gi, '_')}_TrackMate Estimate_${estimate.estimate_number}.pdf`;
    
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(pdfUri, {
        mimeType: 'application/pdf',
        dialogTitle: `Share ${estimate.project_name} Estimate`,
        UTI: 'com.adobe.pdf',
      });
    } else {
      throw new Error('Sharing is not available on this device');
    }
  } catch (error) {
    console.error('PDF sharing error:', error);
    throw error;
  }
};
