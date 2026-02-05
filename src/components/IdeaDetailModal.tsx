import { useState, useRef, useEffect } from 'react';
import { Idea, IdeaStatus, STATUS_COLORS } from '../models';
import { IdeaService } from '../services';
import { CATEGORIES, ClassificationCategory } from '../models/Classification';

interface IdeaDetailModalProps {
  idea: Idea;
  onClose: () => void;
  onUpdateStatus: (idea: Idea, status: IdeaStatus, reviewData: { classification?: string; priority?: number; remarks?: string; reviewedBy?: string }) => void;
}

export function IdeaDetailModal({ idea, onClose, onUpdateStatus }: IdeaDetailModalProps) {
  const [classification, setClassification] = useState<ClassificationCategory | ''>(idea.classification || '');
  // For Under Review ideas, only use existing priority if it's a valid selection (1-4)
  // Otherwise default to 0 (Not selected)
  const initialPriority = (idea.priority && idea.priority >= 1 && idea.priority <= 4) ? idea.priority : 0;
  const [priority, setPriority] = useState<number>(initialPriority);
  const [priorityTouched, setPriorityTouched] = useState<boolean>(initialPriority > 0);
  const [remarks, setRemarks] = useState<string>(idea.adminRemarks || '');
  const [reviewer, setReviewer] = useState<string>(idea.reviewedBy || '');
  const [availableReviewers, setAvailableReviewers] = useState<string[]>(['Paul', 'Lester']);
  const [isAddingReviewer, setIsAddingReviewer] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);


  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [remarks]);

  useEffect(() => {
    const fetchReviewers = async () => {
      const service = new IdeaService();
      const distinctReviewers = await service.getReviewers();
      // Ensure default options are present
      const combined = Array.from(new Set([...distinctReviewers, 'Paul', 'Lester'])).sort();
      setAvailableReviewers(combined);
    };
    fetchReviewers();
  }, []);

  const [error, setError] = useState<string | null>(null);
  const [confirmationAction, setConfirmationAction] = useState<IdeaStatus | null>(null);

  const handleStatusChange = (newStatus: IdeaStatus) => {
    setError(null);
    
    if (newStatus === 'Approved' || newStatus === 'Rejected') {
      if (!reviewer) {
        setError('Reviewer is required');
        return;
      }
    }

    if (newStatus === 'Approved') {
      if (!classification) {
        setError('Classification is required');
        return;
      }
      
      if (priority === 0 || !priorityTouched) {
        setError('Please select a priority level (1-Low to 4-Critical) before approving');
        return;
      }
    }


    
    // Set the pending action to show the confirmation UI
    setConfirmationAction(newStatus);
  };

  const handleConfirmStatusChange = () => {
    if (!confirmationAction) return;

    onUpdateStatus(idea, confirmationAction, {
      classification: classification || undefined,
      priority: priority > 0 ? priority : undefined,
      remarks: remarks || undefined,
      reviewedBy: reviewer || undefined
    });
    setConfirmationAction(null);
    onClose();
  };

  const cancelConfirmation = () => {
    setConfirmationAction(null);
  };

  const getPriorityColor = (value: number) => {
    if (value === 0) return 'text-gray-400';
    if (value === 4) return 'text-red-600';
    if (value === 3) return 'text-orange-600';
    if (value === 2) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getPriorityLabel = (value: number) => {
    if (value === 0) return 'Not yet selected';
    if (value === 4) return 'Critical';
    if (value === 3) return 'High';
    if (value === 2) return 'Medium';
    return 'Low';
  };

  const canPerformActions = idea.status === 'Submitted' || idea.status === 'Under Review';
  const isReadOnly = idea.status === 'Approved' || idea.status === 'Rejected';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-2 sm:p-4 overflow-y-auto pt-4 sm:pt-8">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm fixed" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-auto max-h-none lg:max-h-[92vh] overflow-visible lg:overflow-hidden animate-modal-in flex flex-col my-auto">
        {/* Header */}
        <div className="bg-primary-900 px-6 py-4 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-tighter rounded bg-white/10 text-white/90 border border-white/20">
                    ID: {idea.id}
                  </span>
                  <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest rounded-full ${STATUS_COLORS[idea.status]}`}>
                    {idea.status}
                  </span>
                </div>
                <h2 className="text-xl font-bold truncate max-w-md">{idea.title}</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-gray-50/30">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Idea Core & Process (7/12) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.168.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18 18.247 18.477 16.5 18c-1.746 0-3.168.477-4.5 1.253" /></svg>
                  </div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Idea Description</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-primary-600 uppercase tracking-tight">Idea Title</label>
                    <p className="text-sm font-medium text-gray-900 leading-tight">{idea.title}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-primary-600 uppercase tracking-tight">Implementation Plan / Goal</label>
                    <div className="mt-2 bg-primary-50/30 rounded-xl p-4 border border-primary-50">
                      <p className="text-sm font-normal text-gray-800 leading-relaxed whitespace-pre-wrap">{idea.description}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Current Process</h3>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Process Title</label>
                    <p className="text-sm font-medium text-gray-800">{idea.currentProcessTitle || 'Not Provided'}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Pain Points / Current Workflow</label>
                    <p className="text-sm text-gray-600 italic font-normal leading-relaxed">{idea.currentProcessProblem || 'No additional details recorded'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-3 rounded-xl border flex items-center justify-between ${idea.isManualProcess ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-gray-50 border-gray-100 text-gray-400 opacity-60'}`}>
                      <span className="text-[10px] font-bold uppercase tracking-tight">Manual Process</span>
                      <span className="text-xs font-bold">{idea.isManualProcess ? 'YES' : 'NO'}</span>
                    </div>
                    <div className={`p-3 rounded-xl border flex items-center justify-between ${idea.involvesMultipleDepartments ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-gray-50 border-gray-100 text-gray-400 opacity-60'}`}>
                      <span className="text-[10px] font-bold uppercase tracking-tight">Multi-Dept</span>
                      <span className="text-xs font-bold">{idea.involvesMultipleDepartments ? 'YES' : 'NO'}</span>
                    </div>
                  </div>
                  {idea.involvedDepartments && idea.involvedDepartments.length > 0 && (
                    <div className="pt-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mb-2 block">Affected Departments</label>
                      <div className="flex flex-wrap gap-2">
                        {idea.involvedDepartments.map(dept => (
                          <span key={dept} className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-lg uppercase tracking-widest">{dept}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

           
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-4">Submission Meta</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                  <div>
                    <label className="text-[9px] font-bold text-gray-500 uppercase block mb-1">Submitter</label>
                    <p className="text-xs font-medium text-gray-900 leading-tight">{idea.submitterFirstName} {idea.submitterLastName}</p>
                    <p className="text-[10px] text-primary-600 font-normal truncate">{idea.submitterEmail}</p>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-gray-500 uppercase block mb-1">Date Submitted</label>
                    <p className="text-xs font-medium text-gray-800">
                      {new Date(idea.dateSubmitted).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-gray-500 uppercase block mb-1">Region/Dept</label>
                    <p className="text-xs font-medium text-gray-900">{idea.country} ({idea.department})</p>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-gray-500 uppercase block mb-1">Expected Benefit</label>
                    <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded uppercase">{idea.expectedBenefit}</span>
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-gray-500 uppercase block mb-1">Frequency</label>
                    <p className="text-xs font-medium text-gray-900">{idea.frequency}</p>
                  </div>
                </div>
              </div>

              {idea.status !== 'Submitted' ? (
                <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100 border-l-4 border-l-primary-600">
                  <h3 className="text-xs font-bold text-primary-800 uppercase tracking-widest mb-5 flex items-center justify-between">Admin Assessment</h3>
                  <div className="space-y-5">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 block">Final Classification</label>
                      <select
                        value={classification}
                        onChange={(e) => setClassification(e.target.value as ClassificationCategory)}
                        disabled={isReadOnly}
                        className={`w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold focus:ring-2 focus:ring-primary-100 outline-none transition-all ${isReadOnly ? 'bg-gray-50' : 'bg-white'}`}
                      >
                        <option value="">Select Category</option>
                        {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 block flex justify-between">
                        Priority Level
                        <span className={`font-bold ${getPriorityColor(priority)} ${priority === 0 ? 'text-red-500' : ''}`}>
                          {getPriorityLabel(priority)} {priority > 0 && `(${priority})`}
                          {priority === 0 && <span className="ml-1">⚠</span>}
                        </span>
                      </label>
                      <input
                        type="range" min="0" max="4" value={priority}
                        onChange={(e) => { setPriority(Number(e.target.value)); setPriorityTouched(true); }}
                        disabled={isReadOnly}
                        className={`w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer ${priority === 0 ? 'accent-gray-400' : 'accent-primary-600'}`}
                      />
                      <div className="flex justify-between mt-1 px-0.5">
                        <span className="text-[9px] text-gray-400 font-medium italic">Not selected</span>
                        <span className="text-[9px] text-gray-400 font-medium">1-Low</span>
                        <span className="text-[9px] text-gray-400 font-medium">2-Med</span>
                        <span className="text-[9px] text-gray-400 font-medium">3-High</span>
                        <span className="text-[9px] text-gray-400 font-medium">4-Crit</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 block">Admin Assessment Remarks</label>
                      {isReadOnly ? (
                        <div className="w-full px-3 py-3 rounded-xl border border-gray-100 bg-gray-50/50 text-xs font-medium text-gray-700 italic whitespace-pre-wrap min-h-[100px]">
                          {remarks || 'No detailed assessment remarks provided.'}
                        </div>
                      ) : (
                        <textarea
                          ref={textareaRef}
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                          className="w-full px-3 py-3 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-primary-100 outline-none transition-all resize-none bg-white overflow-hidden shadow-inner"
                          placeholder="Type your evaluation details here..."
                          style={{ minHeight: '120px' }}
                        />
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 block">Reviewer</label>
                      <div className="flex gap-2">
                        {isAddingReviewer ? (
                           <div className="flex-1 flex gap-2">
                             <input 
                               type="text" 
                               value={reviewer}
                               onChange={(e) => setReviewer(e.target.value)}
                               placeholder="Enter reviewer name"
                               disabled={isReadOnly}
                               className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold focus:ring-2 focus:ring-primary-100 outline-none transition-all bg-white"
                               autoFocus
                             />
                             <button
                               onClick={() => { setIsAddingReviewer(false); setReviewer(''); }}
                               className="px-3 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-xl"
                             >
                               Cancel
                             </button>
                           </div>
                        ) : (
                          <select
                            value={availableReviewers.includes(reviewer) ? reviewer : ''}
                            onChange={(e) => {
                              if (e.target.value === '__NEW__') {
                                setIsAddingReviewer(true);
                                setReviewer('');
                              } else {
                                setReviewer(e.target.value);
                              }
                            }}
                            disabled={isReadOnly}
                            className={`w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold focus:ring-2 focus:ring-primary-100 outline-none transition-all ${isReadOnly ? 'bg-gray-50' : 'bg-white'}`}
                          >
                            <option value="">Select Reviewer</option>
                            {availableReviewers.map((r) => <option key={r} value={r}>{r}</option>)}
                            <option value="__NEW__" className="text-primary-600 font-bold">+ Add New Reviewer</option>
                          </select>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-primary-50 rounded-2xl p-6 border border-primary-100/50 flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-primary-800 uppercase mb-1">Pending Initial Review</h4>
                    <p className="text-[11px] text-primary-700 leading-relaxed font-medium">This submission has not been processed. Click <strong>"Start Review"</strong> in the actions below to categorize and score it.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-4 bg-white shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {error && <span className="text-red-600 text-xs font-bold">{error}</span>}
            <button 
              onClick={onClose}
              className="px-4 py-2 text-[10px] font-bold text-gray-500 hover:text-gray-800 transition-colors uppercase tracking-widest border border-gray-100 rounded-lg"
            >
              Close
            </button>
            
            {canPerformActions && (
              <div className="flex items-center gap-3">
                {idea.status === 'Submitted' ? (
                  <button
                    onClick={() => handleStatusChange('Under Review')}
                    className="px-6 py-2.5 text-[10px] font-bold text-white bg-primary-700 hover:bg-primary-800 rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2 uppercase tracking-widest"
                  >
                    Start Review
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleStatusChange('Rejected')}
                      className="px-6 py-2.5 text-[10px] font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-sm active:scale-95 uppercase tracking-widest"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleStatusChange('Approved')}
                      className="px-6 py-2.5 text-[10px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm active:scale-95 uppercase tracking-widest"
                    >
                      Approve
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Confirmation Dialog Overlay */}
      {confirmationAction && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-scale-in border border-gray-100">
            <div className="flex flex-col items-center text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${confirmationAction === 'Approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                {confirmationAction === 'Approved' ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                )}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm {confirmationAction}?</h3>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                Are you sure you want to <strong>{confirmationAction?.toLowerCase()}</strong> this idea? This action requires confirmation.
              </p>
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={cancelConfirmation}
                  className="flex-1 px-4 py-2.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmStatusChange}
                  className={`flex-1 px-4 py-2.5 text-xs font-bold text-white rounded-xl transition-all shadow-lg active:scale-95 uppercase tracking-widest ${
                    confirmationAction === 'Approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Yes, {confirmationAction}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
