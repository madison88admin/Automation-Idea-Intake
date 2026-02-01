import { Idea, IdeaStatus, Department, ExpectedBenefit, Country } from '../models';

export class IdeaService {
  private generateId(): string {
    return `idea_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  submitIdea(data: {
    title: string;
    description: string;
    department: Department;
    country: Country;
    expectedBenefit: ExpectedBenefit;
    frequency: string;
    submitterName: string;
    currentProcessTitle?: string;
    currentProcessProblem?: string;
    isManualProcess?: boolean;
    involvesMultipleDepartments?: boolean;
    involvedDepartments?: Department[];
  }): Idea {
    const idea: Idea = {
      id: this.generateId(),
      ...data,
      dateSubmitted: new Date(),
      status: 'Submitted'
    };

    return idea;
  }

  getAllIdeas(): Idea[] {
    return [];
  }

  getIdeaById(_id: string): Idea | undefined {
    return undefined;
  }

  updateIdeaStatus(
    _id: string,
    _status: IdeaStatus,
    _reviewData: {
      classification?: string;
      priority?: number;
      remarks?: string;
    }
  ): void {
    // No-op until Supabase is connected
  }

  getIdeasByStatus(_status: IdeaStatus): Idea[] {
    return [];
  }

  getIdeasByDepartment(_department: Department): Idea[] {
    return [];
  }

  getStatistics() {
    return {
      total: 0,
      byStatus: {
        Submitted: 0,
        'Under Review': 0,
        Approved: 0,
        Rejected: 0,
      },
      byDepartment: {} as Record<string, number>,
      classificationStats: {
        'Automation': 0,
        'Process Improvement': 0,
        'Operational Enhancement': 0
      },
      evaluationStats: {
        'Critical': 0,
        'High': 0,
        'Medium': 0,
        'Low': 0
      }
    };
  }
}