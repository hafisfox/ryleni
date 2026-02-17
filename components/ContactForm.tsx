import React, { useState, useRef } from 'react';
import { Link2, FileText, CheckCircle2, AlertCircle, Loader2, X, UploadCloud } from 'lucide-react';
import { ContactFormData, FormStatus } from '../types';
import { submitContactForm } from '../services/webhook';
import Input from './Input';
import Select from './Select';

const STAGE_OPTIONS = [
  { value: '', label: 'Select...' },
  { value: 'idea', label: 'Idea Stage' },
  { value: 'mvp', label: 'MVP' },
  { value: 'pre-seed', label: 'Pre-Seed' },
  { value: 'seed', label: 'Seed' },
  { value: 'series-a', label: 'Series A' },
];

const TEAM_SIZE_OPTIONS = [
  { value: '', label: 'Select...' },
  { value: '1-5', label: '1 - 5' },
  { value: '6-10', label: '6 - 10' },
  { value: '11-25', label: '11 - 25' },
  { value: '26-50', label: '26 - 50' },
  { value: '50+', label: '50+' },
];

const ContactForm: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<ContactFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    website: '',
    oneLinePitch: '',
    stage: '',
    teamSize: '',
    pitchDeckUrl: '',
    pitchDeckFileName: '',
    pitchDeckFileContent: '',
  });

  const [pitchType, setPitchType] = useState<'url' | 'file'>('url');
  const [status, setStatus] = useState<FormStatus>(FormStatus.IDLE);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (status === FormStatus.ERROR) setStatus(FormStatus.IDLE);
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 10MB limit
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

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          pitchDeckFileName: file.name,
          pitchDeckFileContent: reader.result as string,
          pitchDeckUrl: '' // Clear URL when file is present
        }));
        setStatus(FormStatus.IDLE);
        setErrorMessage('');
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFormData(prev => ({
      ...prev,
      pitchDeckFileName: '',
      pitchDeckFileContent: ''
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validate = (): boolean => {
    if (!formData.firstName.trim()) return false;
    if (!formData.lastName.trim()) return false;
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) return false;
    if (!formData.phone.trim()) return false;
    if (!formData.companyName.trim()) return false;
    if (!formData.oneLinePitch.trim()) return false;
    if (!formData.stage) return false;
    if (!formData.teamSize) return false;
    
    if (pitchType === 'url') {
      if (!formData.pitchDeckUrl.trim()) return false;
    } else {
      if (!formData.pitchDeckFileName) return false;
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
      await submitContactForm(formData);
      setStatus(FormStatus.SUCCESS);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        companyName: '',
        website: '',
        oneLinePitch: '',
        stage: '',
        teamSize: '',
        pitchDeckUrl: '',
        pitchDeckFileName: '',
        pitchDeckFileContent: '',
      });
      setPitchType('url');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      setStatus(FormStatus.ERROR);
      setErrorMessage("We couldn't submit your application. Please try again.");
    }
  };

  if (status === FormStatus.SUCCESS) {
    return (
      <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center animate-fade-in h-full flex flex-col items-center justify-center min-h-[600px]">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-4">Application Submitted!</h3>
        <p className="text-slate-600 mb-8 max-w-md">
          Thank you for applying. We've received your details and our team will review your application shortly.
        </p>
        <button 
          onClick={() => setStatus(FormStatus.IDLE)}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
        >
          Submit Another Application
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-10 animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-10">
        
        {/* Section 1: Founder Info */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">1</div>
            <h2 className="text-xl font-bold text-slate-900">Founder Info</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              id="firstName"
              name="firstName"
              label="First Name"
              placeholder="John"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <Input
              id="lastName"
              name="lastName"
              label="Last Name"
              placeholder="Doe"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <Input
            id="email"
            name="email"
            type="email"
            label="Email"
            placeholder="john@company.com"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <Input
            id="phone"
            name="phone"
            type="tel"
            label="Phone Number"
            placeholder="+91 98765 43210"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>

        {/* Section 2: Company Details */}
        <div className="space-y-6 pt-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">2</div>
            <h2 className="text-xl font-bold text-slate-900">Company Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input
              id="companyName"
              name="companyName"
              label="Company Name"
              placeholder="Acme Inc."
              value={formData.companyName}
              onChange={handleChange}
              required
            />
            <Input
              id="website"
              name="website"
              label="Website"
              placeholder="acme.com"
              value={formData.website}
              onChange={handleChange}
            />
          </div>

          <Input
            id="oneLinePitch"
            name="oneLinePitch"
            label="One-line Pitch"
            placeholder="We help X do Y by Z..."
            value={formData.oneLinePitch}
            onChange={handleChange}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Select
              id="stage"
              name="stage"
              label="Stage"
              options={STAGE_OPTIONS}
              value={formData.stage}
              onChange={handleChange}
              required
            />
            <Select
              id="teamSize"
              name="teamSize"
              label="Team Size"
              options={TEAM_SIZE_OPTIONS}
              value={formData.teamSize}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 ml-1">
              Pitch Deck <span className="text-red-500">*</span>
            </label>
            
            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
              <div className="flex border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => setPitchType('url')}
                  className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                    pitchType === 'url' ? 'bg-blue-50 text-blue-700' : 'bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <Link2 className="w-4 h-4" />
                  Paste URL
                </button>
                <div className="w-px bg-slate-200"></div>
                <button
                  type="button"
                  onClick={() => setPitchType('file')}
                  className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                    pitchType === 'file' ? 'bg-blue-50 text-blue-700' : 'bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Upload File
                </button>
              </div>
              
              <div className="p-4 bg-slate-50">
                {pitchType === 'url' ? (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                      <Link2 className="w-4 h-4" />
                    </div>
                    <input
                      type="url"
                      name="pitchDeckUrl"
                      placeholder="https://docsend.com/..."
                      value={formData.pitchDeckUrl}
                      onChange={handleChange}
                      className="block w-full rounded-lg border-slate-200 border pl-10 pr-4 py-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
                    />
                  </div>
                ) : (
                  <>
                    <input 
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="application/pdf"
                      className="hidden"
                    />
                    
                    {!formData.pitchDeckFileName ? (
                      <div 
                        onClick={handleFileClick}
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
                            <p className="text-sm font-medium text-slate-700 truncate">{formData.pitchDeckFileName}</p>
                            <p className="text-xs text-slate-500">Ready to submit</p>
                          </div>
                        </div>
                        <button 
                          type="button"
                          onClick={removeFile}
                          className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-md transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {status === FormStatus.ERROR && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-sm animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={status === FormStatus.LOADING}
            className={`
              w-full py-4 rounded-lg font-bold text-white text-base
              shadow-lg shadow-blue-600/20 transition-all duration-300 transform hover:-translate-y-0.5
              ${status === FormStatus.LOADING 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
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
          <p className="text-center text-xs text-slate-400 mt-4">
            Secure 256-bit encrypted transmission.
          </p>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;