import React from 'react';
import ContactForm from './components/ContactForm';
import { Check } from 'lucide-react';

const BenefitItem: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-start gap-3">
    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
      <Check className="w-3.5 h-3.5 text-blue-600" strokeWidth={3} />
    </div>
    <span className="text-slate-600 font-medium leading-relaxed">{text}</span>
  </div>
);

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Column: Benefits & Support */}
          <div className="w-full lg:w-[380px] space-y-6 flex-shrink-0 lg:sticky lg:top-8">
            {/* What you'll get card */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-6">What you'll get</h2>
              <div className="space-y-5">
                <BenefitItem text="Access to $100K - $5M in funding" />
                <BenefitItem text="Hands-on support from operators" />
                <BenefitItem text="Network of 150+ portfolio founders" />
                <BenefitItem text="Go-to-market acceleration program" />
              </div>
            </div>

            {/* Need help card */}
            <div className="bg-blue-50/80 rounded-2xl p-8 border border-blue-100">
              <h3 className="font-bold text-slate-900 mb-2">Need help?</h3>
              <p className="text-slate-600 text-sm mb-3 leading-relaxed">
                Have questions about the application process? Reach out to our team.
              </p>
              <a href="mailto:apply@ryleni.com" className="text-blue-600 font-semibold text-sm hover:underline">
                apply@ryleni.com
              </a>
            </div>
          </div>

          {/* Right Column: Form */}
          <div className="w-full flex-1">
            <ContactForm />
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;