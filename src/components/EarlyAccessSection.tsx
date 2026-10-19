import React, { useState } from 'react';
import { Mail, Check, AlertCircle, Copy, ArrowRight } from 'lucide-react';

interface FormData {
  fullName: string;
  workEmail: string;
  companyName: string;
  businessType: string;
  estimatedVolume: string;
}

export const EarlyAccessSection: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    workEmail: '',
    companyName: '',
    businessType: 'Wholesale & Distribution',
    estimatedVolume: '100 - 500 documents/month'
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submittedData, setSubmittedData] = useState<FormData | null>(null);
  const [copied, setCopied] = useState(false);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    }

    if (!formData.workEmail.trim()) {
      newErrors.workEmail = 'Work email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.workEmail)) {
      newErrors.workEmail = 'Please provide a valid email address.';
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmittedData({ ...formData });

    // Open pre-populated mail client cleanly
    const subject = encodeURIComponent(`Early Access Inquiry - ${formData.companyName}`);
    const body = encodeURIComponent(
      `Full Name: ${formData.fullName}\nWork Email: ${formData.workEmail}\nCompany Name: ${formData.companyName}\nBusiness Type: ${formData.businessType}\nEstimated Volume: ${formData.estimatedVolume}\n\nNote: LedgerLens AI early access request.`
    );
    window.location.href = `mailto:earlyaccess@ledgerlens.ai?subject=${subject}&body=${body}`;
  };

  const handleCopyDetails = () => {
    if (!submittedData) return;
    const text = `Full Name: ${submittedData.fullName}\nWork Email: ${submittedData.workEmail}\nCompany Name: ${submittedData.companyName}\nBusiness Type: ${submittedData.businessType}\nEstimated Volume: ${submittedData.estimatedVolume}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <section id="early-access" className="bg-[#F7F8F6] py-16 md:py-24 border-b border-[#E2E6E1]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Context & Instructions */}
          <div className="lg:col-span-5">
            <p className="text-[12px] font-semibold tracking-wider uppercase text-[#176B50] mb-3">
              Early Access & Technical Feedback
            </p>
            <h2 className="text-[28px] sm:text-[36px] font-bold text-[#202722] tracking-tight leading-[1.15] mb-4">
              Help shape the future of document intelligence.
            </h2>
            <p className="text-[16px] text-[#626B64] leading-relaxed mb-6">
              We're developing LedgerLens AI for businesses that want to simplify document processing and improve
              the quality of their financial records.
            </p>
            <p className="text-[14px] text-[#626B64] leading-relaxed mb-8">
              We are working directly with early pilot partners to refine our extraction heuristics, arithmetic
              validation rules, and approval workflows against real-world paperwork challenges.
            </p>

            <div className="border-t border-[#E2E6E1] pt-6 space-y-3 text-[13px] text-[#626B64]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#176B50]" />
                <span>Private technical development cohort</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#176B50]" />
                <span>Direct communication with the engineering team</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#176B50]" />
                <span>Direct contact: <a href="mailto:earlyaccess@ledgerlens.ai" className="text-[#176B50] font-medium underline">earlyaccess@ledgerlens.ai</a></span>
              </div>
            </div>
          </div>

          {/* Right Column: Restrained Form (Rectangular, 4px radius, clear validation) */}
          <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#E2E6E1] rounded-[6px] p-6 sm:p-8">
            {submittedData ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-[#E2E6E1]">
                  <div className="w-6 h-6 rounded-[3px] bg-[#EDF4EF] flex items-center justify-center text-[#176B50]">
                    <Check className="w-4 h-4" />
                  </div>
                  <h3 className="text-[17px] font-bold text-[#202722]">
                    Inquiry Pre-Formatted for Transmission
                  </h3>
                </div>

                <p className="text-[14px] text-[#626B64] leading-relaxed">
                  LedgerLens AI is in private development. To maintain transparency, this marketing website does not
                  store credentials or persist submissions to a database. Your inquiry has been prepared for dispatch to our team:
                </p>

                <div className="p-4 bg-[#F7F8F6] border border-[#E2E6E1] rounded-[4px] font-mono text-[12px] space-y-1 text-[#202722]">
                  <div><span className="text-[#626B64]">Name:</span> {submittedData.fullName}</div>
                  <div><span className="text-[#626B64]">Email:</span> {submittedData.workEmail}</div>
                  <div><span className="text-[#626B64]">Company:</span> {submittedData.companyName}</div>
                  <div><span className="text-[#626B64]">Type:</span> {submittedData.businessType}</div>
                  <div><span className="text-[#626B64]">Volume:</span> {submittedData.estimatedVolume}</div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <a
                    href={`mailto:earlyaccess@ledgerlens.ai?subject=Early Access - ${encodeURIComponent(submittedData.companyName)}&body=${encodeURIComponent(
                      `Name: ${submittedData.fullName}\nEmail: ${submittedData.workEmail}\nCompany: ${submittedData.companyName}\nType: ${submittedData.businessType}\nVolume: ${submittedData.estimatedVolume}`
                    )}`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#176B50] hover:bg-[#12563F] text-white text-[14px] font-medium rounded-[4px] transition-colors focus-ring"
                  >
                    <Mail className="w-4 h-4" />
                    Open in Mail Client
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyDetails}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-[#E2E6E1] hover:border-[#176B50] text-[#202722] text-[14px] font-medium rounded-[4px] transition-colors bg-[#FFFFFF]"
                  >
                    {copied ? <Check className="w-4 h-4 text-[#176B50]" /> : <Copy className="w-4 h-4 text-[#626B64]" />}
                    {copied ? 'Copied to Clipboard' : 'Copy Inquiry Text'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSubmittedData(null)}
                    className="text-[13px] text-[#626B64] hover:text-[#202722] underline sm:ml-auto"
                  >
                    Edit details
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="fullName" className="block text-[13px] font-medium text-[#202722] mb-1">
                      Full Name <span className="text-[#A33A32]">*</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Alex Adeyemi"
                      className={`w-full px-3 py-2 text-[14px] text-[#202722] bg-[#FFFFFF] border rounded-[4px] focus-ring transition-colors ${
                        errors.fullName ? 'border-[#A33A32]' : 'border-[#E2E6E1]'
                      }`}
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-[12px] text-[#A33A32] flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Work Email */}
                  <div>
                    <label htmlFor="workEmail" className="block text-[13px] font-medium text-[#202722] mb-1">
                      Work Email <span className="text-[#A33A32]">*</span>
                    </label>
                    <input
                      type="email"
                      id="workEmail"
                      value={formData.workEmail}
                      onChange={(e) => setFormData({ ...formData, workEmail: e.target.value })}
                      placeholder="alex@company.com"
                      className={`w-full px-3 py-2 text-[14px] text-[#202722] bg-[#FFFFFF] border rounded-[4px] focus-ring transition-colors ${
                        errors.workEmail ? 'border-[#A33A32]' : 'border-[#E2E6E1]'
                      }`}
                    />
                    {errors.workEmail && (
                      <p className="mt-1 text-[12px] text-[#A33A32] flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.workEmail}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Company Name */}
                  <div>
                    <label htmlFor="companyName" className="block text-[13px] font-medium text-[#202722] mb-1">
                      Company Name <span className="text-[#A33A32]">*</span>
                    </label>
                    <input
                      type="text"
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="e.g. West Coast Distribution Ltd."
                      className={`w-full px-3 py-2 text-[14px] text-[#202722] bg-[#FFFFFF] border rounded-[4px] focus-ring transition-colors ${
                        errors.companyName ? 'border-[#A33A32]' : 'border-[#E2E6E1]'
                      }`}
                    />
                    {errors.companyName && (
                      <p className="mt-1 text-[12px] text-[#A33A32] flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.companyName}
                      </p>
                    )}
                  </div>

                  {/* Business Type */}
                  <div>
                    <label htmlFor="businessType" className="block text-[13px] font-medium text-[#202722] mb-1">
                      Business Type
                    </label>
                    <select
                      id="businessType"
                      value={formData.businessType}
                      onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                      className="w-full px-3 py-2 text-[14px] text-[#202722] bg-[#FFFFFF] border border-[#E2E6E1] rounded-[4px] focus-ring transition-colors"
                    >
                      <option value="Wholesale & Distribution">Wholesale & Distribution</option>
                      <option value="Accounting / Bookkeeping Firm">Accounting / Bookkeeping Firm</option>
                      <option value="Import / Export & Procurement">Import / Export & Procurement</option>
                      <option value="Logistics & Warehousing">Logistics & Warehousing</option>
                      <option value="Growing Commercial Enterprise">Growing Commercial Enterprise</option>
                      <option value="Other">Other Document-Heavy Business</option>
                    </select>
                  </div>
                </div>

                {/* Estimated Monthly Document Volume */}
                <div>
                  <label htmlFor="estimatedVolume" className="block text-[13px] font-medium text-[#202722] mb-1">
                    Estimated Monthly Document Volume
                  </label>
                  <select
                    id="estimatedVolume"
                    value={formData.estimatedVolume}
                    onChange={(e) => setFormData({ ...formData, estimatedVolume: e.target.value })}
                    className="w-full px-3 py-2 text-[14px] text-[#202722] bg-[#FFFFFF] border border-[#E2E6E1] rounded-[4px] focus-ring transition-colors"
                  >
                    <option value="Under 100 documents/month">Under 100 documents / month</option>
                    <option value="100 - 500 documents/month">100 - 500 documents / month</option>
                    <option value="500 - 2,500 documents/month">500 - 2,500 documents / month</option>
                    <option value="2,500+ documents/month">2,500+ documents / month</option>
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 text-[15px] font-medium text-white bg-[#176B50] hover:bg-[#12563F] rounded-[4px] transition-colors focus-ring"
                  >
                    <span>Request Early Access</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>

                <p className="text-[12px] text-[#626B64] pt-2">
                  Transparent note: Information is processed client-side and directed to our technical review team via configured mail handler. No third-party ad trackers or sales automation databases.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
