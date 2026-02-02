import { useState, useEffect } from 'react';
import { Idea, User, IdeaStatus } from '../models';
import { DEPARTMENTS, COUNTRIES } from '../models/Idea';
import { IdeaService } from '../services';
import { LoginForm, StatCard, IdeaTable, IdeaDetailModal, ChartCard, BarChart, DonutChart, ProgressCircle } from '../components';

interface AdminDashboardProps {
  onLoginSuccess: (user: User) => void;
  onNavigate?: (view: any) => void;
  user: User | null;
}

export function AdminDashboard({ onLoginSuccess, onNavigate, user }: AdminDashboardProps) {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [stats, setStats] = useState<ReturnType<IdeaService['getStatistics']> | null>(null);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = () => {
    const ideaService = new IdeaService();
    setIdeas(ideaService.getAllIdeas());
    setStats(ideaService.getStatistics());
  };

  const handleUpdateStatus = (
    idea: Idea, 
    status: IdeaStatus, 
    reviewData: { classification?: string; priority?: number; remarks?: string }
  ) => {
    const ideaService = new IdeaService();
    ideaService.updateIdeaStatus(idea.id, status, reviewData);
    loadData();
    setSelectedIdea(null);
  };

  if (!user) return <LoginForm onLoginSuccess={onLoginSuccess} />;

  const departmentData = DEPARTMENTS.map((dept, index) => ({
    label: dept, value: stats?.byDepartment[dept] || 0,
    color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'][index % 8]
  })).filter(d => d.value > 0);

  const countryData = COUNTRIES.map((country, index) => ({
    label: country, value: stats?.byCountry[country] || 0,
    color: ['#3b82f6', '#10b981', '#f59e0b'][index % 3]
  })).filter(d => d.value > 0);

  const statusData = [
    { label: 'Submitted', value: stats?.byStatus.Submitted || 0, color: '#3b82f6' },
    { label: 'Under Review', value: stats?.byStatus['Under Review'] || 0, color: '#f59e0b' },
    { label: 'Approved', value: stats?.byStatus.Approved || 0, color: '#10b981' },
    { label: 'Rejected', value: stats?.byStatus.Rejected || 0, color: '#ef4444' }
  ].filter(d => d.value > 0);

  const classificationData = [
    { label: 'Automation', value: stats?.classificationStats['Automation'] || 0, color: '#3b82f6' },
    { label: 'Process Improvement', value: stats?.classificationStats['Process Improvement'] || 0, color: '#10b981' },
    { label: 'Operational Enhancement', value: stats?.classificationStats['Operational Enhancement'] || 0, color: '#f59e0b' }
  ].filter(d => d.value > 0);

  const approvalRate = stats && stats.total > 0 ? Math.round((stats.byStatus.Approved / stats.total) * 100) : 0;
  const reviewRate = stats && stats.total > 0 ? Math.round(((stats.byStatus.Approved + stats.byStatus.Rejected) / stats.total) * 100) : 0;

  return (
    <div className="min-h-[calc(100vh-64px)] py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-primary-700 to-primary-600 rounded-2xl p-6 mb-6 text-white">
          <h1 className="text-2xl font-bold mb-1">Welcome, {user.name}</h1>
          <p className="text-white/80">Overview of all submitted ideas and their status.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard title="Total Ideas" value={stats?.total || 0} color="blue" icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>} />
          <StatCard title="Pending Review" value={(stats?.byStatus.Submitted || 0) + (stats?.byStatus['Under Review'] || 0)} color="orange" icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
          <StatCard title="Approved" value={stats?.byStatus.Approved || 0} color="green" icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
          <StatCard title="Rejected" value={stats?.byStatus.Rejected || 0} color="red" icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <ChartCard title="Ideas by Department">{departmentData.length > 0 ? <BarChart data={departmentData} /> : <div className="h-32 flex items-center justify-center text-gray-400">No data</div>}</ChartCard>
          <ChartCard title="Classification Distribution">{classificationData.length > 0 ? <DonutChart data={classificationData} centerLabel="Total" centerValue={stats?.total || 0} /> : <div className="h-32 flex items-center justify-center text-gray-400">No data</div>}</ChartCard>
          <ChartCard title="Performance Metrics"><div className="flex justify-around items-center h-32"><ProgressCircle value={approvalRate} label="Approval Rate" color="#10b981" /><ProgressCircle value={reviewRate} label="Review Rate" color="#3b82f6" /></div></ChartCard>
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
                const percentage = stats && stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                const colors: Record<string, string> = { Critical: 'bg-red-500', High: 'bg-orange-500', Medium: 'bg-yellow-500', Low: 'bg-gray-400' };
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
                    <p className="text-[10px] text-gray-400 font-medium">{percentage}% of total</p>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Latest Submissions</h2>
            <button 
              onClick={() => onNavigate && (onNavigate as any)('ideas')} 
              className="text-sm font-bold text-primary-600 hover:text-primary-700"
            >
              View All Submissions →
            </button>
          </div>
          <IdeaTable ideas={ideas.slice(0, 5)} onViewDetails={setSelectedIdea} />
        </div>
      </div>

      {selectedIdea && (
        <IdeaDetailModal 
          idea={selectedIdea} 
          onClose={() => setSelectedIdea(null)} 
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}
