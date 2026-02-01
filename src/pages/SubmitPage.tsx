import { useState } from 'react';
import { Idea } from '../models';
import { IdeaForm, SuccessModal } from '../components';

export function SubmitPage() {
  const [successModal, setSuccessModal] = useState<{ isOpen: boolean; idea?: Idea }>({ isOpen: false });

  const handleSubmitSuccess = (idea: Idea) => {
    setSuccessModal({ isOpen: true, idea });
  };

  return (
    <div className="min-h-[calc(100vh-112px)] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero banner */}
        <div className="bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900 rounded-2xl p-8 mb-8 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary-600/20 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-500/10 rounded-full translate-y-1/2 -translate-x-1/4" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white/10 backdrop-blur rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">Submit Your Automation Idea</h1>
            </div>
            <p className="text-primary-200 text-sm max-w-lg">
              Have an idea to automate a manual process or improve efficiency? Fill out the form below and our team will review it.
            </p>
          </div>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Card header */}
          <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-base font-semibold text-gray-800">Idea Submission Form</h2>
            <p className="text-xs text-gray-500 mt-0.5">Fields marked with <span className="text-red-500">*</span> are required</p>
          </div>

          {/* Form body */}
          <div className="p-8">
            <IdeaForm onSubmitSuccess={handleSubmitSuccess} />
          </div>
        </div>
      </div>

      {successModal.idea && (
        <SuccessModal isOpen={successModal.isOpen} onClose={() => setSuccessModal({ isOpen: false })} title={successModal.idea.title} ideaId={successModal.idea.id} />
      )}
    </div>
  );
}
