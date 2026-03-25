import { ContactFormData } from '../types';

const WEBHOOK_URL = 'https://n8n.srv1046139.hstgr.cloud/webhook/ryleni-form';

export const submitContactForm = async (data: ContactFormData & { leadScore: number }): Promise<void> => {
  try {
    const formData = new FormData();

    // Append standard fields
    formData.append('firstName', data.firstName);
    formData.append('lastName', data.lastName);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    formData.append('companyName', data.companyName);
    formData.append('website', data.website);
    formData.append('industry', data.industry);
    formData.append('oneLinePitch', data.oneLinePitch);
    formData.append('stage', data.stage);
    formData.append('teamSize', data.teamSize);
    formData.append('founderSetup', data.founderSetup);
    formData.append('leadScore', data.leadScore.toString());
    
    // Legal & Incorporation
    formData.append('isIncorporated', data.isIncorporated);
    if (data.isIncorporated === 'Yes') {
      formData.append('incorporationYear', data.incorporationYear);
      formData.append('roc', data.roc);
      formData.append('companyPan', data.companyPan);
      formData.append('tan', data.tan);
      if (data.cinNumber) formData.append('cinNumber', data.cinNumber);
      if (data.gstNumber) formData.append('gstNumber', data.gstNumber);
      if (data.incorporationCertificateFile) formData.append('incorporationCertificateFile', data.incorporationCertificateFile);
      if (data.incorporationCertificateFileName) formData.append('incorporationCertificateFileName', data.incorporationCertificateFileName);
      if (data.msmeCertificateFile) formData.append('msmeCertificateFile', data.msmeCertificateFile);
      if (data.msmeCertificateFileName) formData.append('msmeCertificateFileName', data.msmeCertificateFileName);
    }

    // Product & MVP
    formData.append('hasMvp', data.hasMvp);
    if (data.hasMvp === 'Yes') {
      if (data.appLink) formData.append('appLink', data.appLink);
      if (data.businessModelFile) formData.append('businessModelFile', data.businessModelFile);
      if (data.businessModelFileName) formData.append('businessModelFileName', data.businessModelFileName);
      if (data.revenueModelFile) formData.append('revenueModelFile', data.revenueModelFile);
      if (data.revenueModelFileName) formData.append('revenueModelFileName', data.revenueModelFileName);
      formData.append('activeCompliances', JSON.stringify(data.activeCompliances));
    }

    // Financials & Traction
    formData.append('isGeneratingRevenue', data.isGeneratingRevenue);
    if (data.isGeneratingRevenue === 'Yes') {
      if (data.currentRevenue) formData.append('currentRevenue', data.currentRevenue);
      if (data.pnlStatementFile) formData.append('pnlStatementFile', data.pnlStatementFile);
      if (data.pnlStatementFileName) formData.append('pnlStatementFileName', data.pnlStatementFileName);
    }

    // Append pitch deck info
    if (data.pitchDeckUrl) formData.append('pitchDeckUrl', data.pitchDeckUrl);
    if (data.pitchDeckFileName) formData.append('pitchDeckFileName', data.pitchDeckFileName);
    if (data.pitchDeckFile) formData.append('pitchDeckFile', data.pitchDeckFile);

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      // No Content-Type header needed; fetch sets it automatically for FormData including the boundary
      body: formData,
    });

    if (!response.ok) {
      // Throw error for non-2xx responses so the UI can show an error state
      throw new Error(`Webhook submission failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error("Webhook Error:", error);
    throw error;
  }
};