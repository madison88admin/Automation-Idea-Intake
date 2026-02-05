import { useState } from 'react';
import { Idea, DEPARTMENTS, EXPECTED_BENEFITS, Department, ExpectedBenefit, Country, COUNTRIES } from '../models';
import { IdeaService, EmailService } from '../services';

interface IdeaFormProps {
  onSubmitSuccess: (idea: Idea) => void;
}

export function IdeaForm({ onSubmitSuccess }: IdeaFormProps) {
  const [formData, setFormData] = useState({
    submitterFirstName: '',
    submitterLastName: '',
    submitterEmailPrefix: '',
    submitterEmailDomain: '@madison88.com',
    department: '' as Department | '',
    country: '' as Country | '',
    title: '',
    description: '',
    frequency: '',
    expectedBenefit: '' as ExpectedBenefit | '',
    currentProcessTitle: '',
    currentProcessProblem: '',
    isManualProcess: false,
    involvesMultipleDepartments: false,
    involvedDepartments: [] as Department[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [currentStep, setCurrentStep] = useState<'edit' | 'preview'>('edit');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.submitterFirstName.trim()) newErrors.submitterFirstName = 'First name is required';
    if (!formData.submitterLastName.trim()) newErrors.submitterLastName = 'Last name is required';
    if (!formData.submitterEmailPrefix.trim()) {
      newErrors.submitterEmailPrefix = 'Email is required';
    }
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.country) newErrors.country = 'Country is required';
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.frequency) newErrors.frequency = 'Frequency is required';
    if (!formData.expectedBenefit) newErrors.expectedBenefit = 'Expected benefit is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      // Scroll to first error
      const firstError = Object.keys(errors)[0];
      const element = document.getElementsByName(firstError)[0];
      if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setCurrentStep('preview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const ideaService = new IdeaService();
      const idea = await ideaService.submitIdea({
        title: formData.title,
        description: formData.description,
        department: formData.department as Department,
        country: formData.country as Country,
        expectedBenefit: formData.expectedBenefit as ExpectedBenefit,
        frequency: formData.frequency,
        submitterFirstName: formData.submitterFirstName,
        submitterLastName: formData.submitterLastName,
        submitterEmail: `${formData.submitterEmailPrefix}${formData.submitterEmailDomain}`,
        currentProcessTitle: formData.currentProcessTitle,
        currentProcessProblem: formData.currentProcessProblem,
        isManualProcess: formData.isManualProcess,
        involvesMultipleDepartments: formData.involvesMultipleDepartments,
        involvedDepartments: formData.involvesMultipleDepartments ? formData.involvedDepartments : undefined
      });

      if (idea) {
        // Send confirmation email (non-blocking)
        const emailService = new EmailService();
        emailService.sendConfirmationEmail({
          referenceId: idea.id,
          submitterName: `${formData.submitterFirstName} ${formData.submitterLastName}`,
          submitterEmail: `${formData.submitterEmailPrefix}${formData.submitterEmailDomain}`,
          ideaTitle: formData.title,
          department: formData.department,
          dateSubmitted: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        });

        // Reset form
        setFormData({
          submitterFirstName: '', submitterLastName: '', submitterEmailPrefix: '', submitterEmailDomain: '@madison88.com', department: '', country: '', title: '', description: '',
          frequency: '', expectedBenefit: '', currentProcessTitle: '', currentProcessProblem: '',
          isManualProcess: false, involvesMultipleDepartments: false, involvedDepartments: []
        });
        setCurrentStep('edit');
        onSubmitSuccess(idea);
      }
    } catch (err) {
      console.error('Failed to submit idea:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDepartmentToggle = (dept: Department) => {
    setFormData(prev => ({
      ...prev,
      involvedDepartments: prev.involvedDepartments.includes(dept)
        ? prev.involvedDepartments.filter(d => d !== dept)
        : [...prev.involvedDepartments, dept]
    }));
  };

  const inputClass = (field: string) =>
    `w-full px-3.5 py-2.5 rounded-lg border transition-all duration-200 outline-none text-sm ${
      errors[field]
        ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
        : 'border-gray-300 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
    }`;

  const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

  if (currentStep === 'preview') {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="bg-primary-50 border border-primary-100 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-primary-900">Review Your Idea</h2>
              <p className="text-sm text-primary-700">Please review all information before final submission.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Submitter Info Preview */}
          <div className="space-y-6">
            <section className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Submitter Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Full Name</p>
                  <p className="text-sm font-semibold text-gray-800">{formData.submitterFirstName} {formData.submitterLastName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Email Address</p>
                  <p className="text-sm font-semibold text-gray-800">{formData.submitterEmailPrefix}{formData.submitterEmailDomain}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Department</p>
                    <p className="text-sm font-semibold text-gray-800">{formData.department}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Country</p>
                    <p className="text-sm font-semibold text-gray-800">{formData.country}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Process Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Current Process</p>
                  <p className="text-sm font-semibold text-gray-800">{formData.currentProcessTitle || 'Not specified'}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Manual Process?</p>
                    <p className="text-sm font-semibold text-gray-800">{formData.isManualProcess ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Multi-Department?</p>
                    <p className="text-sm font-semibold text-gray-800">{formData.involvesMultipleDepartments ? 'Yes' : 'No'}</p>
                  </div>
                </div>
                {formData.involvesMultipleDepartments && formData.involvedDepartments.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Involved Departments</p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {formData.involvedDepartments.map(dept => (
                        <span key={dept} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase">{dept}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Idea Info Preview */}
          <div className="space-y-6">
            <section className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm h-full">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Idea Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Title</p>
                  <p className="text-sm font-bold text-primary-900 border-l-2 border-primary-500 pl-3 py-1 bg-primary-50/30 rounded-r-lg break-all">{formData.title}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Description</p>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-all">{formData.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Frequency</p>
                    <p className="text-sm font-semibold text-gray-800">{formData.frequency}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Expected Benefit</p>
                    <span className="inline-flex px-2 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-md">{formData.expectedBenefit}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="flex justify-between items-center pt-8 border-t border-gray-100 mt-8">
          <button
            type="button"
            onClick={() => setCurrentStep('edit')}
            className="flex items-center gap-2 px-6 py-3 text-sm font-bold text-gray-600 hover:text-primary-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Edit
          </button>
          
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="px-10 py-3.5 bg-gradient-to-r from-primary-700 to-primary-800 text-white font-bold rounded-xl shadow-lg hover:shadow-primary-200 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 flex items-center gap-3"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                Confirm & Submit Idea
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>

        <p className="text-center text-[11px] text-gray-400 max-w-md mx-auto">
          By submitting, you agree that your idea will be reviewed by the Madison 88 Business Solutions Asia IT Department Team. 
          A confirmation email will be sent to <span className="font-bold text-gray-500">{formData.submitterEmailPrefix}{formData.submitterEmailDomain}</span>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handlePreview} className="space-y-8">
      {/* Section: Submitter Details */}
      <section>
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-primary-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Submitter Information</h3>
            <p className="text-xs text-gray-400">Tell us who you are</p>
          </div>
        </div>

        <div className="space-y-5 pl-[42px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>First Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="submitterFirstName"
                value={formData.submitterFirstName}
                onChange={(e) => setFormData({ ...formData, submitterFirstName: e.target.value })}
                placeholder="Enter your first name"
                className={inputClass('submitterFirstName')}
              />
              {errors.submitterFirstName && <p className="mt-1.5 text-xs text-red-500">{errors.submitterFirstName}</p>}
            </div>
            <div>
              <label className={labelClass}>Last Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="submitterLastName"
                value={formData.submitterLastName}
                onChange={(e) => setFormData({ ...formData, submitterLastName: e.target.value })}
                placeholder="Enter your last name"
                className={inputClass('submitterLastName')}
              />
              {errors.submitterLastName && <p className="mt-1.5 text-xs text-red-500">{errors.submitterLastName}</p>}
            </div>
          </div>

          <div>
            <label className={labelClass}>Email Address <span className="text-red-500">*</span></label>
            <div className="flex gap-0 relative">
              <div className="relative flex-1">
                <input
                  type="text"
                  name="submitterEmailPrefix"
                  value={formData.submitterEmailPrefix}
                  onChange={(e) => setFormData({ ...formData, submitterEmailPrefix: e.target.value.replace(/\s+/g, '') })}
                  placeholder="Enter email ID"
                  className={`${inputClass('submitterEmailPrefix')} pl-10 rounded-r-none border-r-0`}
                />
                <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <select
                value={formData.submitterEmailDomain}
                onChange={(e) => setFormData({ ...formData, submitterEmailDomain: e.target.value })}
                className="px-3 py-2.5 bg-gray-50 border border-gray-300 rounded-r-lg text-sm font-medium text-gray-600 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
              >
                <option value="@madison88.com">@madison88.com</option>
                <option value=".madison88@outlook.com">.madison88@outlook.com</option>
              </select>
            </div>
            <p className="mt-1 text-[10px] text-gray-400">Reference ID and updates will be sent to this email</p>
            {errors.submitterEmailPrefix && <p className="mt-1.5 text-xs text-red-500">{errors.submitterEmailPrefix}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Department <span className="text-red-500">*</span></label>
              <select
                name="department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value as Department })}
                className={inputClass('department')}
              >
                <option value="">Select department</option>
                {DEPARTMENTS.map((dept: Department) => <option key={dept} value={dept}>{dept}</option>)}
              </select>
              {errors.department && <p className="mt-1.5 text-xs text-red-500">{errors.department}</p>}
            </div>

            <div>
              <label className={labelClass}>Country <span className="text-red-500">*</span></label>
              <select
                name="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value as Country })}
                className={inputClass('country')}
              >
                <option value="">Select country</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.country && <p className="mt-1.5 text-xs text-red-500">{errors.country}</p>}
            </div>
          </div>
        </div>
      </section>

      <hr className="border-gray-100" />

      {/* Section: Idea Information */}
      <section>
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Idea Information</h3>
            <p className="text-xs text-gray-400">Describe your automation idea</p>
          </div>
        </div>

        <div className="space-y-5 pl-[42px]">
          <div>
            <label className={labelClass}>Idea Title <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter a clear, concise title for your idea"
              className={inputClass('title')}
            />
            {errors.title && <p className="mt-1.5 text-xs text-red-500">{errors.title}</p>}
          </div>

          <div>
            <label className={labelClass}>Description <span className="text-red-500">*</span></label>
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your idea in detail — what problem does it solve and how?"
              rows={4}
              className={inputClass('description')}
            />
            {errors.description && <p className="mt-1.5 text-xs text-red-500">{errors.description}</p>}
          </div>

          <div>
            <label className={labelClass}>Frequency <span className="text-red-500">*</span></label>
            <select
              name="frequency"
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              className={inputClass('frequency')}
            >
              <option value="">How often should this run?</option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="Real-time / On-demand">Real-time / On-demand</option>
            </select>
            {errors.frequency && <p className="mt-1.5 text-xs text-red-500">{errors.frequency}</p>}
          </div>
        </div>
      </section>

      <hr className="border-gray-100" />

      {/* Section: Current Process */}
      <section>
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Current Process Details</h3>
            <p className="text-xs text-gray-400">Tell us about the existing process (optional)</p>
          </div>
        </div>

        <div className="space-y-5 pl-[42px]">
          <div>
            <label className={labelClass}>Current Process Title</label>
            <input
              type="text"
              value={formData.currentProcessTitle}
              onChange={(e) => setFormData({ ...formData, currentProcessTitle: e.target.value })}
              placeholder="What is the name of the current process?"
              className={inputClass('currentProcessTitle')}
            />
          </div>

          <div>
            <label className={labelClass}>Current Process Problem / Description</label>
            <textarea
              value={formData.currentProcessProblem}
              onChange={(e) => setFormData({ ...formData, currentProcessProblem: e.target.value })}
              placeholder="Describe the problems encountered with the current process"
              rows={3}
              className={inputClass('currentProcessProblem')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Is the current process manual?</label>
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isManualProcess: true })}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    formData.isManualProcess
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isManualProcess: false })}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    !formData.isManualProcess
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  No
                </button>
              </div>
            </div>

            <div>
              <label className={labelClass}>Does this involve multiple departments?</label>
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, involvesMultipleDepartments: true })}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    formData.involvesMultipleDepartments
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, involvesMultipleDepartments: false, involvedDepartments: [] })}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    !formData.involvesMultipleDepartments
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          </div>

          {formData.involvesMultipleDepartments && (
            <div>
              <label className={labelClass}>Involved Departments</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {DEPARTMENTS.map((dept) => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => handleDepartmentToggle(dept)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                      formData.involvedDepartments.includes(dept)
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <hr className="border-gray-100" />

      {/* Section: Benefits */}
      <section>
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Expected Benefits</h3>
            <p className="text-xs text-gray-400">What improvement do you expect?</p>
          </div>
        </div>

        <div className="pl-[42px]">
          <label className={labelClass}>Expected Benefit <span className="text-red-500">*</span></label>
          <select
            name="expectedBenefit"
            value={formData.expectedBenefit}
            onChange={(e) => setFormData({ ...formData, expectedBenefit: e.target.value as ExpectedBenefit })}
            className={inputClass('expectedBenefit')}
          >
            <option value="">Select expected benefit</option>
            {EXPECTED_BENEFITS.map((benefit: ExpectedBenefit) => <option key={benefit} value={benefit}>{benefit}</option>)}
          </select>
          {errors.expectedBenefit && <p className="mt-1.5 text-xs text-red-500">{errors.expectedBenefit}</p>}
        </div>
      </section>

      {/* Action buttons */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
        <button
          type="button"
          onClick={() => setShowClearConfirm(true)}
          className="px-6 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Clear Form
        </button>
        <button
          type="submit"
          className="px-8 py-2.5 text-sm font-bold text-white bg-primary-700 hover:bg-primary-800 rounded-lg transition-all shadow-md active:scale-[0.98] flex items-center gap-2"
        >
          Review Idea
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <p className="text-center text-[11px] text-gray-400 max-w-md mx-auto pt-4">
        By proceeding, you agree that your data will be reviewed by the Madison 88 Business Solutions Asia IT Department Team.
      </p>

      {/* Clear form confirmation dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-backdrop-in" onClick={() => setShowClearConfirm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-modal-in">
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">Clear Form?</h3>
              <p className="text-sm text-gray-500 mb-6">All the information you've entered will be removed. This can't be undone.</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      submitterFirstName: '', submitterLastName: '', submitterEmailPrefix: '', submitterEmailDomain: '@madison88.com', department: '', country: '', title: '', description: '',
                      frequency: '', expectedBenefit: '', currentProcessTitle: '', currentProcessProblem: '',
                      isManualProcess: false, involvesMultipleDepartments: false, involvedDepartments: []
                    });
                    setErrors({});
                    setShowClearConfirm(false);
                  }}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors active:scale-[0.98]"
                >
                  Clear Everything
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
