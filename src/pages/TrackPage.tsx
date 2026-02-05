import { useState, useEffect } from 'react';
import { Idea, IdeaStatus, Department, Country, STATUS_COLORS, DEPARTMENTS, COUNTRIES, getPriorityLabel, getPriorityColor } from '../models';
import { IdeaService } from '../services';

export function TrackPage() {
  const [searchId, setSearchId] = useState('');
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<Idea[]>([]);
  const [filters, setFilters] = useState({
    status: '' as IdeaStatus | '',
    department: '' as Department | '',
    country: '' as Country | '',
    dateSingle: '',
    dateFrom: '',
    dateTo: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [showDateRange, setShowDateRange] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const ideaService = new IdeaService();
        const allIdeas = await ideaService.getAllIdeas();
        setIdeas(allIdeas);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    let result = [...ideas];
    
    // Search by ID/Reference
    if (searchId.trim()) {
      result = result.filter(idea => 
        idea.id.toLowerCase().includes(searchId.toLowerCase())
      );
    }

    // Status Filter
    if (filters.status) {
      result = result.filter(idea => idea.status === filters.status);
    }

    // Department Filter
    if (filters.department) {
      result = result.filter(idea => idea.department === filters.department);
    }

    // Country Filter
    if (filters.country) {
      result = result.filter(idea => idea.country === filters.country);
    }

    // Single Date Filter
    if (filters.dateSingle && !filters.dateFrom && !filters.dateTo) {
      const selected = new Date(filters.dateSingle);
      selected.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filters.dateSingle);
      endOfDay.setHours(23, 59, 59, 999);
      result = result.filter(idea => {
        const d = new Date(idea.dateSubmitted);
        return d >= selected && d <= endOfDay;
      });
    }

    // Date Range Filter (advanced)
    if (filters.dateFrom) {
      const from = new Date(filters.dateFrom);
      from.setHours(0, 0, 0, 0);
      result = result.filter(idea => new Date(idea.dateSubmitted) >= from);
    }
    if (filters.dateTo) {
      const to = new Date(filters.dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter(idea => new Date(idea.dateSubmitted) <= to);
    }

    setFilteredIdeas(result);
  }, [searchId, filters, ideas]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-[calc(100vh-112px)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-primary-900 px-8 py-6 text-white">
            <h1 className="text-2xl font-semibold">Track Your Idea</h1>
            <p className="text-theme-200 text-sm mt-1">Search and monitor the status of your submitted ideas.</p>
          </div>

          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Search Reference ID</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    placeholder="Enter Reference ID (e.g., AIT-XXXXX)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                  />
                  <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Department</label>
                <select
                  value={filters.department}
                  onChange={(e) => setFilters({ ...filters, department: e.target.value as Department | '' })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm appearance-none bg-white"
                >
                  <option value="">All Departments</option>
                  {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Country</label>
                <select
                  value={filters.country}
                  onChange={(e) => setFilters({ ...filters, country: e.target.value as Country | '' })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm appearance-none bg-white"
                >
                  <option value="">All Countries</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value as IdeaStatus | '' })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm appearance-none bg-white"
                >
                  <option value="">All Statuses</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div className={showDateRange ? 'md:col-span-2' : ''}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDateRange(!showDateRange);
                      if (!showDateRange) {
                        setFilters(f => ({ ...f, dateSingle: '' }));
                      } else {
                        setFilters(f => ({ ...f, dateFrom: '', dateTo: '' }));
                      }
                    }}
                    className="text-[10px] font-bold text-primary-600 hover:text-primary-700 uppercase tracking-wide transition-colors"
                  >
                    {showDateRange ? 'Simple' : 'Advanced'}
                  </button>
                </div>
                {!showDateRange ? (
                  <input
                    type="date"
                    value={filters.dateSingle}
                    onChange={(e) => setFilters({ ...filters, dateSingle: e.target.value, dateFrom: '', dateTo: '' })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm bg-white"
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] text-gray-400 mb-1">From</p>
                      <input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value, dateSingle: '' })}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm bg-white"
                      />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 mb-1">To</p>
                      <input
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => setFilters({ ...filters, dateTo: e.target.value, dateSingle: '' })}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm bg-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    setFilters({ status: '', department: '', country: '', dateSingle: '', dateFrom: '', dateTo: '' });
                    setShowDateRange(false);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-500 hover:bg-gray-100 transition-all"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
                <p className="text-sm text-gray-400 font-medium">Tracking your submissions...</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-white border-b border-gray-100">
                    <th className="px-6 py-4 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-4 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Reference ID</th>
                    <th className="px-6 py-4 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Idea Title</th>
                    <th className="px-6 py-4 text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-4 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-4 text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredIdeas.length > 0 ? (
                    filteredIdeas.map((idea) => (
                      <div key={idea.id} style={{ display: 'contents' }}>
                        <tr 
                          className={`hover:bg-gray-50/50 transition-all cursor-pointer ${expandedRow === idea.id ? 'bg-primary-50/50' : ''}`}
                          onClick={() => setExpandedRow(expandedRow === idea.id ? null : idea.id)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                            {formatDate(idea.dateSubmitted)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-xs font-semibold text-theme-700 bg-primary-50 px-2 py-1 rounded">
                              {idea.id}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-gray-800 line-clamp-1 break-all">{idea.title}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-xs font-medium text-gray-600">{idea.department}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            {(idea.status === 'Approved' || idea.status === 'Rejected') ? (
                              <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${getPriorityColor(getPriorityLabel(idea.priority))}`}>
                                {getPriorityLabel(idea.priority)}
                              </span>
                            ) : (
                              <span className="text-gray-300 text-[10px]">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${STATUS_COLORS[idea.status]}`}>
                              {idea.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 ml-auto">
                              {expandedRow === idea.id ? 'Less' : 'More'}
                              <svg 
                                className={`w-4 h-4 transition-transform ${expandedRow === idea.id ? 'rotate-180' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                        
                        {/* Expanded Content */}
                        {expandedRow === idea.id && (
                          <tr key={`${idea.id}-expanded`}>
                            <td colSpan={7} className="px-8 py-6 bg-gray-50/30 border-l-4 border-primary-500">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-full overflow-hidden">
                                <div className="space-y-4 min-w-0">
                                  <div>
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Idea Title</h4>
                                    <p className="text-sm font-bold text-gray-900 leading-snug break-words overflow-hidden">{idea.title}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Description</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap break-words overflow-hidden">{idea.description}</p>
                                  </div>
                                </div>

                                <div className="space-y-4 min-w-0">
                                  <div>
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Current Process</h4>
                                    <p className="text-sm font-semibold text-gray-800 break-words overflow-hidden">{idea.currentProcessTitle || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Process Problem / Description</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap break-words overflow-hidden">{idea.currentProcessProblem || 'N/A'}</p>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </div>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                        <div className="flex flex-col items-center gap-2">
                          <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm">No matching ideas found.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
