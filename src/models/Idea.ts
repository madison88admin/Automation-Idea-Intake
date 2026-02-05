import { ClassificationCategory } from './Classification';

// Idea Model
export interface Idea {
  id: string;
  title: string;
  description: string;
  department: Department;
  country: Country;
  expectedBenefit: ExpectedBenefit;
  frequency: string;
  submitterFirstName: string;
  submitterLastName: string;
  submitterEmail: string;
  dateSubmitted: Date;
  status: IdeaStatus;
  // Current process fields
  currentProcessTitle?: string;
  currentProcessProblem?: string;
  isManualProcess?: boolean;
  involvesMultipleDepartments?: boolean;
  involvedDepartments?: Department[];
  // Admin review fields
  classification?: ClassificationCategory;
  priority?: number; // 0=Not selected, 1=Low, 2=Medium, 3=High, 4=Critical
  adminRemarks?: string;
  reviewedBy?: string;
}

// Country
export type Country = 'Philippines' | 'US' | 'Indonesia';

// Department 
export type Department = 
  | 'IT'
  | 'HR'
  | 'Costing'
  | 'Logistics'
  | 'Planning'
  | 'Purchasing'
  | 'Admin'
;

// Expected Benefit 
export type ExpectedBenefit =
  | 'Automation'
  | 'Process Improvement';

// Idea Status (removed Rerouted)
export type IdeaStatus = 
  | 'Submitted'
  | 'Under Review'
  | 'Approved'
  | 'Rejected';

export type PriorityLabel = 'Critical' | 'High' | 'Medium' | 'Low';

export const PRIORITY_LABELS: PriorityLabel[] = ['Critical', 'High', 'Medium', 'Low'];

export const getPriorityLabel = (priority?: number): PriorityLabel | 'N/A' => {
  if (!priority || priority === 0) return 'N/A';
  if (priority === 4) return 'Critical';
  if (priority === 3) return 'High';
  if (priority === 2) return 'Medium';
  return 'Low';
};

export const getPriorityColor = (label: PriorityLabel | 'N/A'): string => {
  switch (label) {
    case 'Critical': return 'bg-red-800 text-white';
    case 'High': return 'bg-amber-600 text-white';
    case 'Medium': return 'bg-blue-600 text-white';
    case 'Low': return 'bg-slate-500 text-white';
    default: return 'bg-gray-100 text-gray-400';
  }
};

export const COUNTRIES: Country[] = ['Philippines', 'US', 'Indonesia'];

export const DEPARTMENTS: Department[] = [
  'IT', 'HR', 'Costing', 'Logistics', 'Planning', 'Purchasing', 'Admin'
];

export const EXPECTED_BENEFITS: ExpectedBenefit[] = [
  'Automation', 'Process Improvement'
];

export const STATUS_COLORS: Record<IdeaStatus, string> = {
  'Submitted': 'bg-blue-100 text-blue-700',
  'Under Review': 'bg-orange-100 text-orange-700',
  'Approved': 'bg-emerald-100 text-emerald-700',
  'Rejected': 'bg-red-100 text-red-700',
};
