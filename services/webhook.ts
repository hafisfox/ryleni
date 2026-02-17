import { ContactFormData } from '../types';

const WEBHOOK_URL = 'https://n8n.srv1046139.hstgr.cloud/webhook-test/ryleni-form';

export const submitContactForm = async (data: ContactFormData): Promise<void> => {
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
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