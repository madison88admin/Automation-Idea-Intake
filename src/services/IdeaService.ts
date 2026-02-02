import { Idea, IdeaStatus, Department, ExpectedBenefit, Country } from '../models';

export class IdeaService {
  private generateId(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid ambiguous characters
    let randomPart = '';
    for (let i = 0; i < 5; i++) {
        randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `AIT-${randomPart}`;
  }

  private static ideas: Idea[] = [];

  submitIdea(data: {
    title: string;
    description: string;
    department: Department;
    country: Country;
    expectedBenefit: ExpectedBenefit;
    frequency: string;
    submitterFirstName: string;
    submitterLastName: string;
    submitterEmail: string;
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

    IdeaService.ideas.push(idea);
    return idea;
  }

  getAllIdeas(): Idea[] {
    return [...IdeaService.ideas];
  }

  getIdeaById(id: string): Idea | undefined {
    return IdeaService.ideas.find(i => i.id === id);
  }

  updateIdeaStatus(
    id: string,
    status: IdeaStatus,
    reviewData: {
      classification?: any;
      priority?: number;
      remarks?: string;
    }
  ): void {
    const index = IdeaService.ideas.findIndex(i => i.id === id);
    if (index !== -1) {
      IdeaService.ideas[index] = {
        ...IdeaService.ideas[index],
        status,
        classification: reviewData.classification,
        priority: reviewData.priority,
        adminRemarks: reviewData.remarks
      };
    }
  }

  getStatistics() {
    const stats = {
      total: IdeaService.ideas.length,
      byStatus: {
        Submitted: 0,
        'Under Review': 0,
        Approved: 0,
        Rejected: 0,
      },
      byDepartment: {} as Record<string, number>,
      byCountry: {} as Record<string, number>,
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

    IdeaService.ideas.forEach(idea => {
      // By Status
      stats.byStatus[idea.status]++;

      // By Department
      stats.byDepartment[idea.department] = (stats.byDepartment[idea.department] || 0) + 1;

      // By Country
      stats.byCountry[idea.country] = (stats.byCountry[idea.country] || 0) + 1;

      // By Classification
      if (idea.classification) {
        stats.classificationStats[idea.classification as keyof typeof stats.classificationStats]++;
      }

      // By Priority
      if (idea.priority) {
        if (idea.priority >= 9) stats.evaluationStats.Critical++;
        else if (idea.priority >= 7) stats.evaluationStats.High++;
        else if (idea.priority >= 4) stats.evaluationStats.Medium++;
        else stats.evaluationStats.Low++;
      }
    });

    return stats;
  }
}