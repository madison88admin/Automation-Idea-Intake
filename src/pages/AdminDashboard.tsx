import { useState, useEffect } from 'react';
import { Idea, User, IdeaStatus } from '../models';
import { DEPARTMENTS, COUNTRIES } from '../models/Idea';
import { IdeaService } from '../services';
import { LoginForm, IdeaTable, IdeaDetailModal } from '../components';

interface AdminDashboardProps {
  onLoginSuccess: (user: User) => void;
  onNavigate?: (view: any) => void;
  user: User | null;
}

export function AdminDashboard({ onLoginSuccess, onNavigate, user }: AdminDashboardProps) {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [stats, setStats] = useState<Awaited<ReturnType<IdeaService['getStatistics']>> | null>(null);
  const [filterCountry, setFilterCountry] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) loadData();
  }, [user, filterCountry]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const ideaService = new IdeaService();
      const allIdeas = await ideaService.getAllIdeas();
      const filteredIdeas = filterCountry 
        ? allIdeas.filter(i => i.country === filterCountry)
        : allIdeas;
      
      setIdeas(filteredIdeas.sort((a, b) => new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime()));
      const statistics = await ideaService.getStatistics(filterCountry);
      setStats(statistics);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (
    idea: Idea, 
    status: IdeaStatus, 
    reviewData: { classification?: string; priority?: number; remarks?: string; reviewedBy?: string }
  ) => {
    const ideaService = new IdeaService();
    await ideaService.updateIdeaStatus(idea.id, status, reviewData, user?.name || 'Admin');
    loadData();
    setSelectedIdea(null);
  };

  if (!user) return <LoginForm onLoginSuccess={onLoginSuccess} />;

  const departmentData = DEPARTMENTS.map((dept, index) => ({
    label: dept, value: stats?.byDepartment[dept] || 0,
    color: ['#1e40af', '#047857', '#b45309', '#b91c1c', '#5b21b6', '#be185d', '#0e7490', '#4d7c0f'][index % 8]
  })).filter(d => d.value > 0);

  const countryData = COUNTRIES.map((country, index) => ({
    label: country, value: stats?.byCountry[country] || 0,
    color: ['#1e3a8a', '#065f46', '#92400e'][index % 3]
  })).filter(d => d.value > 0);

  const statusData = [
    { label: 'Submitted', value: stats?.byStatus.Submitted || 0, color: '#1e3a8a' },
    { label: 'Under Review', value: stats?.byStatus['Under Review'] || 0, color: '#b45309' },
    { label: 'Approved', value: stats?.byStatus.Approved || 0, color: '#065f46' },
    { label: 'Rejected', value: stats?.byStatus.Rejected || 0, color: '#991b1b' }
  ].filter(d => d.value > 0);

  const classificationData = [
    { label: 'Automation', value: stats?.classificationStats['Automation'] || 0, color: '#1e3a8a' },
    { label: 'Process Improvement', value: stats?.classificationStats['Process Improvement'] || 0, color: '#065f46' },
    { label: 'Operational Enhancement', value: stats?.classificationStats['Operational Enhancement'] || 0, color: '#b45309' }
  ].filter(d => d.value > 0);

  const approvalRate = stats && stats.total > 0 ? Math.round((stats.byStatus.Approved / stats.total) * 100) : 0;
  const underReviewRate = stats && stats.total > 0 ? Math.round((stats.byStatus['Under Review'] / stats.total) * 100) : 0;

  return (
    <div className="min-h-[calc(100vh-64px)] py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-primary-700 to-primary-600 rounded-2xl p-6 mb-6 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">Madison 88 </h1>
              <p className="text-white/80">Overview of all submitted ideas and their status.</p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <label className="text-xs font-bold uppercase tracking-widest text-white/60">View Region:</label>
              <select 
                value={filterCountry}
                onChange={(e) => setFilterCountry(e.target.value)}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-white/30 transition-all text-white [&>option]:text-gray-900"
              >
                <option value="">Overall (Global)</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          {/* Decorative background shape */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <StatCard title="Overall Ideas" value={stats?.total || 0} color="darkblue" icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>} />
          <StatCard title="Submitted Status" value={stats?.byStatus.Submitted || 0} color="blue" icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20" /></svg>} />
          <StatCard title="Under Review" value={stats?.byStatus['Under Review'] || 0} color="slate" icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
          <StatCard title="Approved" value={stats?.byStatus.Approved || 0} color="green" icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
          <StatCard title="Rejected" value={stats?.byStatus.Rejected || 0} color="red" icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <ChartCard title="Ideas by Department">{departmentData.length > 0 ? <BarChart data={departmentData} /> : <div className="h-32 flex items-center justify-center text-gray-400">No data</div>}</ChartCard>
          <ChartCard title="Classification Distribution">{classificationData.length > 0 ? <DonutChart data={classificationData} centerLabel="Total" centerValue={stats?.total || 0} /> : <div className="h-32 flex items-center justify-center text-gray-400">No data</div>}</ChartCard>
          <ChartCard title="Performance Metrics"><div className="flex justify-around items-center h-32"><ProgressCircle value={approvalRate} label="Approved Rate" color="#047857" /><ProgressCircle value={underReviewRate} label="Under Review Rate" color="#b45309" /></div></ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ChartCard title="Status Overview">{statusData.length > 0 ? <DonutChart data={statusData} centerLabel="Ideas" centerValue={stats?.total || 0} /> : <div className="h-32 flex items-center justify-center text-gray-400">No data</div>}</ChartCard>
          <ChartCard title="Ideas by Country">{countryData.length > 0 ? <DonutChart data={countryData} centerLabel="Total" centerValue={stats?.total || 0} /> : <div className="h-32 flex items-center justify-center text-gray-400">No data</div>}</ChartCard>
        </div>

        <div className="mb-6">
          <ChartCard title="Idea Priority Breakdown">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {['Critical', 'High', 'Medium', 'Low'].map((priority) => {
                    const count = stats?.evaluationStats[priority as keyof typeof stats.evaluationStats] || 0;
                    const approvedCount = stats?.byStatus.Approved || 0;
                    const percentage = approvedCount > 0 ? Math.round((count / approvedCount) * 100) : 0;
                    const colors: Record<string, string> = { Critical: 'bg-red-800', High: 'bg-amber-800', Medium: 'bg-blue-800', Low: 'bg-slate-600' };
                    return (
                      <div key={priority} className="flex flex-col gap-2 p-3 rounded-lg bg-gray-50/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${colors[priority]}`}></span>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{priority}</span>
                          </div>
                          <span className="text-sm font-bold text-gray-800">{count}</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${colors[priority]}`} style={{ width: `${percentage}%` }}></div>
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium">{percentage}% of approved</p>
                      </div>
                    );
              })}
            </div>
          </ChartCard>
        </div>

        <div className="mb-6 relative">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Latest Submissions</h2>
            <button 
              onClick={() => onNavigate && (onNavigate as any)('ideas')} 
              className="text-sm font-semibold text-primary-600 hover:text-primary-700"
            >
              View All Submissions →
            </button>
          </div>
          {isLoading ? (
            <div className="h-64 bg-white rounded-2xl border border-gray-100 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin"></div>
                <p className="text-sm text-gray-400 font-medium">Fetching...</p>
              </div>
            </div>
          ) : (
            <IdeaTable ideas={ideas.slice(0, 5)} onViewDetails={setSelectedIdea} />
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

// --- total ideas pending review approved rejected logo---

interface StatCardProps {
  title: string;
  value: number;
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'darkblue' | 'slate';
  icon: React.ReactNode;
}

const colorMap = {
  blue: 'from-blue-500 to-blue-600',
  darkblue: 'from-blue-800 to-blue-950',
  green: 'from-emerald-500 to-emerald-600',
  orange: 'from-orange-500 to-orange-600',
  red: 'from-red-500 to-red-600',
  purple: 'from-purple-500 to-purple-600',
  slate: 'from-slate-700 to-slate-900',
};

function StatCard({ title, value, color, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[color]} flex items-center justify-center shadow-lg`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

function ChartCard({ title, children }: ChartCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      {children}
    </div>
  );
}

interface ChartData {
  label: string;
  value: number;
  color: string;
}

function BarChart({ data }: { data: ChartData[] }) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="flex items-center gap-3">
          <span className="text-xs text-gray-500 w-24 truncate" title={item.label}>{item.label}</span>
          <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(item.value / maxValue) * 100}%`, backgroundColor: item.color }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700 w-8 text-right">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ data, centerLabel, centerValue }: { data: ChartData[], centerLabel?: string, centerValue?: number }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const size = 120;
  const strokeWidth = 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let currentOffset = 0;

  return (
    <div className="flex items-center justify-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#f3f4f6" strokeWidth={strokeWidth} />
          {data.map((item, index) => {
            const segmentLength = total > 0 ? (item.value / total) * circumference : 0;
            const offset = currentOffset;
            currentOffset += segmentLength;
            return (
              <circle
                key={index} cx={size/2} cy={size/2} r={radius} fill="none"
                stroke={item.color} strokeWidth={strokeWidth}
                strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                strokeDashoffset={-offset} strokeLinecap="round" className="transition-all duration-500"
              />
            );
          })}
        </svg>
        {centerLabel && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-gray-800">{centerValue}</span>
            <span className="text-xs text-gray-500">{centerLabel}</span>
          </div>
        )}
      </div>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-gray-600">{item.label}</span>
            <span className="text-xs font-medium text-gray-800">({item.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProgressCircle({ value, label, color = '#3b82f6' }: { value: number, label: string, color?: string }) {
  const size = 64;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#f3f4f6" strokeWidth={strokeWidth} />
          <circle
            cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
            strokeLinecap="round" className="transition-all duration-500"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-gray-800">{value}%</span>
        </div>
      </div>
      <span className="text-xs text-gray-500 mt-2">{label}</span>
    </div>
  );
}
