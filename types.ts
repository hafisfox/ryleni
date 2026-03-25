import React from 'react';

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyName: string;
  website: string;
  industry: string;
  oneLinePitch: string;
  stage: string;
  teamSize: string;
  founderSetup: string;
  pitchDeckUrl: string;
  pitchDeckFileName?: string;
  pitchDeckFile?: File;
  isIncorporated: string;
  incorporationYear: string;
  roc: string;
  companyPan: string;
  tan: string;
  cinNumber?: string;
  gstNumber?: string;
  incorporationCertificateFileName?: string;
  incorporationCertificateFile?: File;
  msmeCertificateFileName?: string;
  msmeCertificateFile?: File;
  hasMvp: string;
  appLink?: string;
  businessModelFileName?: string;
  businessModelFile?: File;
  revenueModelFileName?: string;
  revenueModelFile?: File;
  activeCompliances: string[];
  isGeneratingRevenue: string;
  currentRevenue?: string;
  pnlStatementFileName?: string;
  pnlStatementFile?: File;
}

export enum FormStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
  error?: string;
  required?: boolean;
}

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  required?: boolean;
}