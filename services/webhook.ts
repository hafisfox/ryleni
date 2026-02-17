import { ContactFormData } from '../types';

const WEBHOOK_URL = 'https://n8n.srv1046139.hstgr.cloud/webhook/ryleni-form';

export const submitContactForm = async (data: ContactFormData): Promise<void> => {
  try {
    const formData = new FormData();

    // Append standard fields
    formData.append('firstName', data.firstName);
    formData.append('lastName', data.lastName);
    formData.append('email', data.email);
    formData.append('phone', data.phone);
    formData.append('companyName', data.companyName);
    formData.append('website', data.website);
    formData.append('oneLinePitch', data.oneLinePitch);
    formData.append('stage', data.stage);
    formData.append('teamSize', data.teamSize);
    
    // Append pitch deck info
    formData.append('pitchDeckUrl', data.pitchDeckUrl);
    
    if (data.pitchDeckFileName) {
      formData.append('pitchDeckFileName', data.pitchDeckFileName);
    }
    
    // Append binary file if it exists
    if (data.pitchDeckFile) {
      formData.append('pitchDeckFile', data.pitchDeckFile);
    }

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