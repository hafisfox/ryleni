import React, { useState, useRef } from 'react';
import { Link2, FileText, CheckCircle2, AlertCircle, Loader2, X, UploadCloud } from 'lucide-react';
import { ContactFormData, FormStatus } from '../types';
import { submitContactForm } from '../services/webhook';
import Input from './Input';
import Select from './Select';
import TextArea from './TextArea';

const INDUSTRY_OPTIONS = [
  { value: '', label: 'Select...' },
  { value: 'FinTech', label: 'FinTech' },
  { value: 'EdTech', label: 'EdTech' },
  { value: 'SaaS', label: 'SaaS' },
  { value: 'D2C', label: 'D2C' },
  { value: 'HealthTech', label: 'HealthTech' },
  { value: 'Other', label: 'Other' },
];

const FOUNDER_SETUP_OPTIONS = [
  { value: '', label: 'Select...' },
  { value: 'Solo', label: 'Solo' },
  { value: 'Co-founders', label: 'Co-founders' },
];

const COMPANY_SIZE_OPTIONS = [
  { value: '', label: 'Select...' },
  { value: '1-5', label: '1 - 5' },
  { value: '5-10', label: '5 - 10' },
  { value: '11-15', label: '11 - 15' },
  { value: '15-20', label: '15 - 20' },
  { value: '20+', label: '20+' },
];

const YES_NO_OPTIONS = [
  { value: '', label: 'Select...' },
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' },
];

// Reused original STAGE_OPTIONS and TEAM_SIZE_OPTIONS, but replacing Team Size with Company Size and Stage with Industry basically. We will use the new options.

const COMPLIANCES = ['ISO', 'FSSAI', 'HIPAA', 'GDPR'];

type FileField = 'pitchDeck' | 'incorporationCertificate' | 'msmeCertificate' | 'businessModel' | 'revenueModel' | 'pnlStatement';

const calculateScore = (data: ContactFormData): number => {
  let score = 0;
  
  if (data.founderSetup === 'Co-founders') score += 2;
  
  if (data.isIncorporated === 'Yes' && (data.incorporationCertificateFile || data.incorporationCertificateFileName)) score += 2;
  
  if (data.hasMvp === 'Yes' && data.appLink) score += 3;
  
  if (data.isGeneratingRevenue === 'Yes' && (data.pnlStatementFile || data.pnlStatementFileName)) score += 3;
  
  let bonus = 0;
  if (data.msmeCertificateFile || data.msmeCertificateFileName) bonus = 1;
  if (data.gstNumber) bonus = 1;
  if (data.activeCompliances.length > 0) bonus = 1;
  
  score += Math.min(bonus, 1); // Up to 1 point buffer
  
  return Math.min(score, 10);
};

const ContactForm: React.FC = () => {
  const fileInputRefs = {
    pitchDeck: useRef<HTMLInputElement>(null),
    incorporationCertificate: useRef<HTMLInputElement>(null),
    msmeCertificate: useRef<HTMLInputElement>(null),
    businessModel: useRef<HTMLInputElement>(null),
    revenueModel: useRef<HTMLInputElement>(null),
    pnlStatement: useRef<HTMLInputElement>(null)
  };
  
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    website: '',
    industry: '',
    oneLinePitch: '',
    stage: '',
    teamSize: '',
    founderSetup: '',
    pitchDeckUrl: '',
    pitchDeckFileName: '',
    pitchDeckFile: undefined,
    isIncorporated: '',
    incorporationYear: '',
    roc: '',
    companyPan: '',
    tan: '',
    cinNumber: '',
    gstNumber: '',
    incorporationCertificateFileName: '',
    incorporationCertificateFile: undefined,
    msmeCertificateFileName: '',
    msmeCertificateFile: undefined,
    hasMvp: '',
    appLink: '',
    businessModelFileName: '',
    businessModelFile: undefined,
    revenueModelFileName: '',
    revenueModelFile: undefined,
    activeCompliances: [],
    isGeneratingRevenue: '',
    currentRevenue: '',
    pnlStatementFileName: '',
    pnlStatementFile: undefined,
  });

  const [pitchType, setPitchType] = useState<'url' | 'file'>('url');
  const [status, setStatus] = useState<FormStatus>(FormStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [submitScore, setSubmitScore] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (status === FormStatus.ERROR) setStatus(FormStatus.IDLE);
  };

  const handleComplianceChange = (compliance: string) => {
    setFormData(prev => ({
      ...prev,
      activeCompliances: prev.activeCompliances.includes(compliance)
        ? prev.activeCompliances.filter(c => c !== compliance)
        : [...prev.activeCompliances, compliance]
    }));
  };

  const handleFileClick = (field: FileField) => {
    fileInputRefs[field].current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: FileField) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage("File size must be less than 10MB");
        setStatus(FormStatus.ERROR);
        return;
      }
      if (file.type !== 'application/pdf') {
        setErrorMessage("Only PDF files are allowed");
        setStatus(FormStatus.ERROR);
        return;
      }

      setFormData(prev => ({
        ...prev,
        [`${field}FileName`]: file.name,
        [`${field}File`]: file,
        ...(field === 'pitchDeck' ? { pitchDeckUrl: '' } : {})
      }));
      setStatus(FormStatus.IDLE);
      setErrorMessage('');
    }
  };

  const removeFile = (e: React.MouseEvent, field: FileField) => {
    e.stopPropagation();
    setFormData(prev => ({
      ...prev,
      [`${field}FileName`]: '',
      [`${field}File`]: undefined
    }));
    if (fileInputRefs[field].current) {
      fileInputRefs[field].current!.value = '';
    }
  };

  const validate = (): boolean => {
    // Section 1
    if (!formData.firstName.trim()) return false;
    if (!formData.lastName.trim()) return false;
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) return false;
    if (!formData.phone.trim()) return false;
    if (!formData.companyName.trim()) return false;
    if (!formData.industry) return false;
    if (!formData.oneLinePitch.trim()) return false;
    if (pitchType === 'url') {
      if (!formData.pitchDeckUrl.trim()) return false;
    } else {
      if (!formData.pitchDeckFileName) return false;
    }

    // Section 2
    if (!formData.founderSetup) return false;
    if (!formData.teamSize) return false;

    // Section 3
    if (!formData.isIncorporated) return false;
    if (formData.isIncorporated === 'Yes') {
      if (!formData.incorporationYear) return false;
      if (!formData.roc) return false;
      if (!formData.companyPan) return false;
      if (!formData.tan) return false;
      if (!formData.incorporationCertificateFileName) return false;
    }

    // Section 4
    if (!formData.hasMvp) return false;
    if (formData.hasMvp === 'Yes') {
      if (!formData.appLink) return false;
      if (!formData.businessModelFileName) return false;
      if (!formData.revenueModelFileName) return false;
    }

    // Section 5
    if (!formData.isGeneratingRevenue) return false;
    if (formData.isGeneratingRevenue === 'Yes') {
      if (!formData.currentRevenue) return false;
      if (!formData.pnlStatementFileName) return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      setErrorMessage("Please fill in all required fields marked with *");
      setStatus(FormStatus.ERROR);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setStatus(FormStatus.LOADING);
    setErrorMessage('');

    try {
      const computedScore = calculateScore(formData);
      await submitContactForm({ ...formData, leadScore: computedScore });
      
      setSubmitScore(computedScore);
      setStatus(FormStatus.SUCCESS);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setStatus(FormStatus.ERROR);
      setErrorMessage("We couldn't submit your application. Please try again.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const FileUploadUI = ({ field, label, required = false }: { field: FileField, label: string, required?: boolean }) => {
    const fileName = formData[`${field}FileName` as keyof ContactFormData] as string;
    
    return (
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700 ml-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
          <div className="p-4 bg-slate-50">
            <input 
              type="file"
              ref={fileInputRefs[field]}
              onChange={(e) => handleFileChange(e, field)}
              accept="application/pdf"
              className="hidden"
            />
            {!fileName ? (
              <div 
                onClick={() => handleFileClick(field)}
                className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center bg-white cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-all group"
              >
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-500 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <p className="text-sm text-slate-700 font-medium">Click to upload PDF</p>
                <p className="text-xs text-slate-400 mt-1">Maximum file size 10MB</p>
              </div>
            ) : (
              <div className="border border-blue-200 bg-blue-50/50 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 bg-white border border-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 text-red-500">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{fileName}</p>
                    <p className="text-xs text-slate-500">Ready to submit</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={(e) => removeFile(e, field)}
                  className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (status === FormStatus.SUCCESS && submitScore !== null) {
    if (submitScore >= 7) {
      return (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center animate-fade-in h-full flex flex-col items-center justify-center min-h-[600px]">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-4">You're Fast-Tracked!</h3>
          <p className="text-slate-600 mb-8 max-w-md">
            Based on your strong application, we'd like to fast-track your direct meeting with the RYLENI team. Pick a time that works best for you.
          </p>
          <a
            href="https://calendly.com"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
          >
            Schedule Meeting
          </a>
        </div>
      );
    } else if (submitScore >= 4) {
      return (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center animate-fade-in h-full flex flex-col items-center justify-center min-h-[600px]">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Application Submitted!</h3>
          <p className="text-slate-600 mb-8 max-w-md">
            Your application is in. Our operations team will perform a quick background check and get back to you with next steps shortly.
          </p>
          <button 
            onClick={() => { setStatus(FormStatus.IDLE); setSubmitScore(null); }}
            className="text-blue-600 font-semibold hover:text-blue-700 transition-colors border border-blue-200 px-6 py-2 rounded-lg hover:bg-blue-50"
          >
            Back to Home
          </button>
        </div>
      );
    } else {
      return (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center animate-fade-in h-full flex flex-col items-center justify-center min-h-[600px]">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-10 h-10 text-slate-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Application Received!</h3>
          <p className="text-slate-600 mb-8 max-w-md">
            While your startup might be too early for direct investment right now, we have resources to help you bridge the gap.
          </p>
          <div className="flex flex-col gap-4 w-full max-w-md">
            <a href="#" className="w-full bg-slate-900 text-white px-6 py-4 rounded-xl font-semibold hover:bg-slate-800 transition-colors flex items-center justify-between">
              <span>Paid Mentorship Masterclass</span>
              <span className="bg-slate-800 px-3 py-1 rounded-md text-sm">₹1,000</span>
            </a>
            <a href="#" className="w-full bg-white text-slate-900 border-2 border-slate-200 px-6 py-4 rounded-xl font-semibold hover:border-slate-300 hover:bg-slate-50 transition-colors text-left flex flex-col">
              <span>RYLENI Product Development</span>
              <span className="text-xs font-normal text-slate-500 mt-1">10-month plan • No equity loss</span>
            </a>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="bg-white mb-20 rounded-2xl shadow-sm border border-slate-100 p-6 md:p-10 animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-12">
        {status === FormStatus.ERROR && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm animate-fade-in mb-8 shadow-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* Section 1: The Basics */}
        <section className="space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm">1</span>
              The Basics
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input id="firstName" name="firstName" label="First Name" placeholder="John" value={formData.firstName} onChange={handleChange} required />
            <Input id="lastName" name="lastName" label="Last Name" placeholder="Doe" value={formData.lastName} onChange={handleChange} required />
          </div>

          <Input id="email" name="email" type="email" label="Email" placeholder="john@company.com" value={formData.email} onChange={handleChange} required />
          <Input id="phone" name="phone" type="tel" label="Phone Number" placeholder="+91 98765 43210" value={formData.phone} onChange={handleChange} required />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input id="companyName" name="companyName" label="Company Name" placeholder="Acme Inc." value={formData.companyName} onChange={handleChange} required />
            <Input id="website" name="website" label="Website (Optional)" placeholder="acme.com" value={formData.website} onChange={handleChange} />
          </div>

          <Select id="industry" name="industry" label="Industry" options={INDUSTRY_OPTIONS} value={formData.industry} onChange={handleChange} required />

          <TextArea id="oneLinePitch" name="oneLinePitch" label="One-line Pitch" placeholder="We help X do Y by Z..." value={formData.oneLinePitch} onChange={handleChange} required />

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 ml-1">
              Pitch Deck <span className="text-red-500">*</span>
            </label>
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
              <div className="flex border-b border-slate-200">
                <button type="button" onClick={() => setPitchType('url')} className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${pitchType === 'url' ? 'bg-blue-50 text-blue-700' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                  <Link2 className="w-4 h-4" /> Paste URL
                </button>
                <div className="w-px bg-slate-200"></div>
                <button type="button" onClick={() => setPitchType('file')} className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${pitchType === 'file' ? 'bg-blue-50 text-blue-700' : 'bg-white text-slate-500 hover:bg-slate-50'}`}>
                  <FileText className="w-4 h-4" /> Upload File
                </button>
              </div>
              <div className="p-4 bg-slate-50">
                {pitchType === 'url' ? (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400"><Link2 className="w-4 h-4" /></div>
                    <input type="url" name="pitchDeckUrl" placeholder="https://docsend.com/..." value={formData.pitchDeckUrl} onChange={handleChange} className="block w-full rounded-lg border-slate-200 border pl-10 pr-4 py-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white" />
                  </div>
                ) : (
                  <FileUploadUI field="pitchDeck" label="Upload Pitch Deck" />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Team Structure */}
        <section className="space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm">2</span>
              Team Structure
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Select id="founderSetup" name="founderSetup" label="Founder Setup" options={FOUNDER_SETUP_OPTIONS} value={formData.founderSetup} onChange={handleChange} required />
            <Select id="teamSize" name="teamSize" label="Company Size" options={COMPANY_SIZE_OPTIONS} value={formData.teamSize} onChange={handleChange} required />
          </div>
        </section>

        {/* Section 3: Legal & Incorporation */}
        <section className="space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm">3</span>
              Legal & Incorporation
            </h2>
          </div>
          
          <Select id="isIncorporated" name="isIncorporated" label="Is the company incorporated?" options={YES_NO_OPTIONS} value={formData.isIncorporated} onChange={handleChange} required />
          
          {formData.isIncorporated === 'Yes' && (
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input id="incorporationYear" name="incorporationYear" label="Incorporation Year" placeholder="2023" type="number" value={formData.incorporationYear} onChange={handleChange} required />
                <Input id="roc" name="roc" label="ROC (Registrar of Companies)" placeholder="ROC-Delhi" value={formData.roc} onChange={handleChange} required />
                <Input id="companyPan" name="companyPan" label="Company PAN" placeholder="ABCDE1234F" value={formData.companyPan} onChange={handleChange} required />
                <Input id="tan" name="tan" label="TAN" placeholder="DELA12345B" value={formData.tan} onChange={handleChange} required />
                <Input id="cinNumber" name="cinNumber" label="CIN Number (Optional)" placeholder="U12345DL..." value={formData.cinNumber || ''} onChange={handleChange} />
                <Input id="gstNumber" name="gstNumber" label="GST Number (Optional)" placeholder="07AABCU9603R1ZM" value={formData.gstNumber || ''} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FileUploadUI field="incorporationCertificate" label="Upload Incorporation Certificate" required />
                <FileUploadUI field="msmeCertificate" label="Upload MSME Certificate (Optional)" />
              </div>
            </div>
          )}
        </section>

        {/* Section 4: Product & MVP */}
        <section className="space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm">4</span>
              Product & MVP
            </h2>
          </div>

          <Select id="hasMvp" name="hasMvp" label="Do you have a working MVP or Live Product?" options={YES_NO_OPTIONS} value={formData.hasMvp} onChange={handleChange} required />

          {formData.hasMvp === 'Yes' && (
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-6 animate-fade-in">
              <Input id="appLink" name="appLink" label="Link to App / Web App" type="url" placeholder="https://..." value={formData.appLink || ''} onChange={handleChange} required />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FileUploadUI field="businessModel" label="Upload Business Model" required />
                <FileUploadUI field="revenueModel" label="Upload Revenue Model" required />
              </div>

              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-slate-700 ml-1">Active Compliances</label>
                <div className="flex flex-wrap gap-3">
                  {COMPLIANCES.map(compliance => (
                    <label key={compliance} className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors ${formData.activeCompliances.includes(compliance) ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" 
                        checked={formData.activeCompliances.includes(compliance)}
                        onChange={() => handleComplianceChange(compliance)}
                      />
                      <span className="text-sm font-medium">{compliance}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Section 5: Financials & Traction */}
        <section className="space-y-6">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm">5</span>
              Financials & Traction
            </h2>
          </div>

          <Select id="isGeneratingRevenue" name="isGeneratingRevenue" label="Are you currently generating revenue?" options={YES_NO_OPTIONS} value={formData.isGeneratingRevenue} onChange={handleChange} required />

          {formData.isGeneratingRevenue === 'Yes' && (
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-6 animate-fade-in">
              <Input id="currentRevenue" name="currentRevenue" label="Current Revenue / Year" placeholder="e.g. ₹50L" value={formData.currentRevenue || ''} onChange={handleChange} required />
              <div className="max-w-md">
                <FileUploadUI field="pnlStatement" label="Upload Year-on-Year PnL Statement" required />
              </div>
            </div>
          )}
        </section>

        {status === FormStatus.ERROR && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm animate-fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        <div className="pt-8 border-t border-slate-100">
          <button
            type="submit"
            disabled={status === FormStatus.LOADING}
            className={`
              w-full py-4 rounded-xl font-bold text-white text-base
              shadow-lg transition-all duration-300 transform hover:-translate-y-0.5
              ${status === FormStatus.LOADING 
                ? 'bg-blue-400 cursor-not-allowed shadow-none' 
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
              }
            `}
          >
            {status === FormStatus.LOADING ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </div>
            ) : (
              'Submit Application'
            )}
          </button>
          <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-2">
            Secure 256-bit encrypted transmission.
          </p>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;