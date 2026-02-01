import { Idea, STATUS_COLORS } from '../models';

interface IdeaTableProps {
  ideas: Idea[];
  onViewDetails: (idea: Idea) => void;
}

export function IdeaTable({ ideas, onViewDetails }: IdeaTableProps) {
  if (ideas.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <p className="text-gray-500">No ideas submitted yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Dept</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Country</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitter</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ideas.map((idea) => (
              <tr key={idea.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4">
                  <button
                    onClick={() => onViewDetails(idea)}
                    className="text-sm font-medium text-gray-800 hover:text-primary-600 text-left"
                  >
                    {idea.title}
                  </button>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">{idea.department}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{idea.country}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{idea.submitterName}</td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {new Date(idea.dateSubmitted).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[idea.status]}`}>
                    {idea.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => onViewDetails(idea)}
                    className="px-3 py-1.5 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
