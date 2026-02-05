import { useState, useEffect } from 'react';
import { Idea, IdeaStatus, Department, DEPARTMENTS, Country, COUNTRIES, PriorityLabel, PRIORITY_LABELS, getPriorityLabel, User } from '../models';
import { IdeaService } from '../services';
import { IdeaTable, IdeaDetailModal } from '../components';

interface AdminIdeasPageProps {
  user: User | null;
}

export function AdminIdeasPage({ user }: AdminIdeasPageProps) {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [filteredIdeas, setFilteredIdeas] = useState<Idea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: '' as IdeaStatus | '',
    department: '' as Department | '',
    country: '' as Country | '',
    priority: '' as PriorityLabel | ''
  });

  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const ideaService = new IdeaService();
      const allIdeas = await ideaService.getAllIdeas();
      setIdeas(allIdeas.sort((a, b) => 
        new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime()
      ));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let result = [...ideas];
    
    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(idea => 
        idea.id.toLowerCase().includes(term) ||
        idea.title.toLowerCase().includes(term) ||
        `${idea.submitterFirstName} ${idea.submitterLastName}`.toLowerCase().includes(term)
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

    // Priority Filter
    if (filters.priority) {
      result = result.filter(idea => 
        getPriorityLabel(idea.priority) === filters.priority
      );
    }

    setFilteredIdeas(result);
  }, [searchTerm, filters, ideas]);

  const handleUpdateStatus = async (
    idea: Idea, 
    status: IdeaStatus, 
    reviewData: { classification?: string; priority?: number; remarks?: string }
  ) => {
    const ideaService = new IdeaService();
    await ideaService.updateIdeaStatus(idea.id, status, reviewData, user?.name || 'Admin');
    loadData();
    setSelectedIdea(null);
  };

  return (
    <div className="min-h-[calc(100vh-112px)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">All Submissions</h1>
          <p className="text-sm text-gray-500 mt-1">Comprehensive list of every automation idea submitted.</p>
        </div>
        
        {/* Management Controls */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search by ID, title, or submitter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <select
              value={filters.country}
              onChange={(e) => setFilters({ ...filters, country: e.target.value as Country | '' })}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">All Regions</option>
              {COUNTRIES.map(country => <option key={country} value={country}>{country}</option>)}
            </select>

            <select
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value as Department | '' })}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)}
            </select>

            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value as PriorityLabel | '' })}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">All Priorities</option>
              {PRIORITY_LABELS.map(label => <option key={label} value={label}>{label}</option>)}
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as IdeaStatus | '' })}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">All Statuses</option>
              <option value="Submitted">Submitted</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <button 
              onClick={loadData}
              className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
              title="Refresh Data"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Results Counter */}
        <div className="mb-4 flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Results: {filteredIdeas.length} ideas</span>
          { (searchTerm || filters.status || filters.department || filters.country) && (
            <button 
              onClick={() => { setSearchTerm(''); setFilters({ status: '', department: '', country: '', priority: '' }); }}
              className="text-xs font-semibold text-primary-600 hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[400px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
              <p className="text-sm text-gray-400 font-medium">Loading submissions...</p>
            </div>
          ) : (
            <IdeaTable ideas={filteredIdeas} onViewDetails={setSelectedIdea} />
          )}
        </div>
      </div>

      {selectedIdea && (
        <IdeaDetailModal
          idea={selectedIdea}
          onClose={() => setSelectedIdea(null)}
          onUpdateStatus={handleUpdateStatus}
          currentUserName={user?.name}
        />
      )}
    </div>
  );
}
