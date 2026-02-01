import { useState } from 'react';
import { Idea, IdeaStatus, STATUS_COLORS } from '../models';
import { CATEGORIES, ClassificationCategory } from '../models/Classification';

interface IdeaDetailModalProps {
  idea: Idea;
  onClose: () => void;
  onUpdateStatus: (idea: Idea, status: IdeaStatus, reviewData: { classification?: string; priority?: number; remarks?: string }) => void;
}

export function IdeaDetailModal({ idea, onClose, onUpdateStatus }: IdeaDetailModalProps) {
  const [classification, setClassification] = useState<ClassificationCategory | ''>(idea.classification || '');
  const [priority, setPriority] = useState<number>(idea.priority || 5);
  const [remarks, setRemarks] = useState<string>(idea.adminRemarks || '');

  const handleStatusChange = (newStatus: IdeaStatus) => {
    onUpdateStatus(idea, newStatus, {
      classification: classification || undefined,
      priority: priority,
      remarks: remarks || undefined
    });
    onClose();
  };

  const getPriorityColor = (value: number) => {
    if (value >= 8) return 'text-red-600';
    if (value >= 6) return 'text-orange-600';
    if (value >= 4) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getPriorityLabel = (value: number) => {
    if (value >= 9) return 'Critical';
    if (value >= 7) return 'High';
    if (value >= 4) return 'Medium';
    return 'Low';
  };

  const canPerformActions = idea.status === 'Submitted' || idea.status === 'Under Review';
  const isReadOnly = idea.status === 'Approved' || idea.status === 'Rejected';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-700 to-primary-600 p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1">{idea.title}</h2>
              <p className="text-white/80 text-sm">ID: {idea.id}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Basic Info Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Status</p>
              <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[idea.status]}`}>
                {idea.status}
              </span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Department</p>
              <p className="font-medium text-gray-800">{idea.department}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Country</p>
              <p className="font-medium text-gray-800">{idea.country}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Submitter</p>
              <p className="font-medium text-gray-800">{idea.submitterName}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Date Submitted</p>
              <p className="font-medium text-gray-800">{new Date(idea.dateSubmitted).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Description</p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 whitespace-pre-wrap">{idea.description}</p>
            </div>
          </div>

          {/* Expected Benefit & Frequency */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Expected Benefit</p>
              <p className="font-medium text-gray-800">{idea.expectedBenefit}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Frequency</p>
              <p className="font-medium text-gray-800">{idea.frequency}</p>
            </div>
          </div>

          {/* Admin Review Section */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Admin Review
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Classification Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Classification
                </label>
                <select
                  value={classification}
                  onChange={(e) => setClassification(e.target.value as ClassificationCategory)}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2.5 rounded-md border border-gray-300 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600 ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
                >
                  <option value="">Select classification</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Priority Slider (1-10) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority: <span className={`font-bold ${getPriorityColor(priority)}`}>{priority}</span>
                  <span className="text-gray-400 font-normal ml-1">({getPriorityLabel(priority)})</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={priority}
                  onChange={(e) => setPriority(Number(e.target.value))}
                  disabled={isReadOnly}
                  className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gray-200"
                  style={{
                    background: isReadOnly ? '#e5e7eb' : `linear-gradient(to right, #10b981 0%, #f59e0b 50%, #ef4444 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1 (Low)</span>
                  <span>10 (Critical)</span>
                </div>
              </div>
            </div>

            {/* Remarks Textarea */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Remarks / Comments
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                disabled={isReadOnly}
                rows={3}
                placeholder={isReadOnly ? 'No remarks added' : 'Add remarks for this idea...'}
                className={`w-full px-3 py-2.5 rounded-md border border-gray-300 text-sm focus:border-primary-600 focus:ring-1 focus:ring-primary-600 resize-none ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
              />
            </div>

            {/* Show existing remarks if read-only */}
            {isReadOnly && idea.adminRemarks && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Previous Admin Remarks</p>
                <p className="text-gray-700">{idea.adminRemarks}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer with Action Buttons */}
        <div className="border-t border-gray-100 p-4 bg-gray-50">
          {canPerformActions ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              
              <div className="flex items-center gap-2">
                {idea.status === 'Submitted' && (
                  <button
                    onClick={() => handleStatusChange('Under Review')}
                    className="px-4 py-2.5 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Start Review
                  </button>
                )}
                
                {idea.status === 'Under Review' && (
                  <>
                    
                    <button
                      onClick={() => handleStatusChange('Rejected')}
                      className="px-4 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Reject
                    </button>
                    <button
                      onClick={() => handleStatusChange('Approved')}
                      className="px-4 py-2.5 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Approve
                    </button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
