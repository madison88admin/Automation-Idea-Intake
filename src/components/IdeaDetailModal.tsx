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
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden animate-fade-in flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-800 to-primary-600 p-6 text-white shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded bg-white/20 text-white border border-white/30`}>
                  Submission ID: {idea.id}
                </span>
                <span className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-widest rounded-full ${STATUS_COLORS[idea.status]}`}>
                  {idea.status}
                </span>
              </div>
              <h2 className="text-2xl font-black">{idea.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors shadow-inner"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Main Content Area (8 columns on large screens) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Highlighted Core Info */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="mb-6">
                  <h3 className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
                    Idea Title
                  </h3>
                  <p className="text-xl font-black text-gray-900 leading-tight">{idea.title}</p>
                </div>
                
                <div>
                  <h3 className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary-600"></div>
                    Idea Description
                  </h3>
                  <div className="bg-primary-50/30 rounded-xl p-4 border border-primary-50">
                    <p className="text-gray-800 font-bold leading-relaxed whitespace-pre-wrap">{idea.description}</p>
                  </div>
                </div>
              </div>

              {/* Current Process Section */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-black text-gray-800 uppercase tracking-tight">Current Process Details</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Process Title</p>
                    <p className="text-base font-bold text-gray-800">{idea.currentProcessTitle || 'Not Provided'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Process Steps / Pain Points</p>
                    <p className="text-sm text-gray-600 italic font-medium leading-relaxed">{idea.currentProcessProblem || 'No additional details provided'}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className={`flex items-center justify-between p-3 rounded-xl border ${idea.isManualProcess ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-gray-50 border-gray-100 text-gray-400 opacity-60'}`}>
                      <span className="text-[10px] font-black uppercase tracking-tight">Manual Process</span>
                      <span className="text-xs font-black">{idea.isManualProcess ? 'YES' : 'NO'}</span>
                    </div>
                    <div className={`flex items-center justify-between p-3 rounded-xl border ${idea.involvesMultipleDepartments ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-gray-50 border-gray-100 text-gray-400 opacity-60'}`}>
                      <span className="text-[10px] font-black uppercase tracking-tight">Multi-Department</span>
                      <span className="text-xs font-black">{idea.involvesMultipleDepartments ? 'YES' : 'NO'}</span>
                    </div>
                  </div>

                  {idea.involvedDepartments && idea.involvedDepartments.length > 0 && (
                    <div className="pt-2">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Affected Departments</p>
                    <div className="flex flex-wrap gap-2">
                        {idea.involvedDepartments.map(dept => (
                          <span key={dept} className="px-2.5 py-1 bg-white border border-gray-200 text-gray-700 text-[9px] font-black rounded-lg uppercase tracking-widest shadow-sm">
                            {dept}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Data (4 columns on large screens) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Submitter Info Card */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Submission Meta</h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Submitter</p>
                    <p className="text-sm font-black text-gray-900">{idea.submitterFirstName} {idea.submitterLastName}</p>
                    <p className="text-xs text-primary-600 font-medium truncate">{idea.submitterEmail}</p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Date Submitted</p>
                    <p className="text-xs font-black text-gray-800">
                      {new Date(idea.dateSubmitted).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Region</p>
                      <p className="text-xs font-black text-gray-800">{idea.country}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">Dept</p>
                      <p className="text-xs font-black text-gray-800">{idea.department}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-50">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-[10px] font-bold text-gray-500 uppercase">Benefit</p>
                      <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-[9px] font-black rounded uppercase">{idea.expectedBenefit}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-[10px] font-bold text-gray-500 uppercase">Freq</p>
                      <span className="text-xs font-black text-gray-800">{idea.frequency}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Review Pop-Out Section */}
              {idea.status !== 'Submitted' ? (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-primary-100 animate-slide-in">
                  <h3 className="text-[10px] font-black text-primary-700 uppercase tracking-widest mb-5 flex items-center justify-between">
                    Admin Assessment
                    <svg className="w-4 h-4 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </h3>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Classification</label>
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
                      <label className="block text-[10px] font-black text-gray-500 uppercase mb-2 flex justify-between">
                        Priority
                        <span className={`font-black ${getPriorityColor(priority)}`}>{getPriorityLabel(priority)} ({priority})</span>
                      </label>
                      <input
                        type="range" min="1" max="10" value={priority}
                        onChange={(e) => setPriority(Number(e.target.value))}
                        disabled={isReadOnly}
                        className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-gray-500 uppercase mb-2">Admin Remarks</label>
                      <textarea
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        disabled={isReadOnly}
                        rows={5}
                        className={`w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-primary-100 outline-none transition-all resize-none ${isReadOnly ? 'bg-gray-50 italic' : 'bg-white'}`}
                        placeholder="Evaluation notes..."
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-primary-50 rounded-2xl p-5 border border-primary-100/50">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-black text-primary-800 uppercase mb-1">New Submission</p>
                      <p className="text-[11px] text-primary-700 leading-relaxed font-medium">To categorize and score this idea, click <strong>"Start Review"</strong>.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-5 bg-white shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 text-xs font-black text-gray-500 hover:text-gray-800 transition-colors uppercase tracking-widest"
            >
              Close Portal
            </button>
            
            {canPerformActions && (
              <div className="flex items-center gap-3">
                {idea.status === 'Submitted' ? (
                  <button
                    onClick={() => handleStatusChange('Under Review')}
                    className="px-8 py-3 text-xs font-black text-white bg-primary-700 hover:bg-primary-800 rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2 uppercase tracking-widest"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Start Review Process
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleStatusChange('Rejected')}
                      className="px-8 py-3 text-xs font-black text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-lg active:scale-95 uppercase tracking-widest"
                    >
                      Reject Submission
                    </button>
                    <button
                      onClick={() => handleStatusChange('Approved')}
                      className="px-8 py-3 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-lg active:scale-95 uppercase tracking-widest"
                    >
                      Approve Implementation
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
