import { EvaluationScore, PriorityLevel, Idea } from '../models';

export class EvaluationService {
  evaluateIdea(idea: Idea): EvaluationScore {
    return {
      id: `eval_${Date.now()}`,
      ideaId: idea.id,
      impact: 0,
      complexity: 0,
      feasibility: 0,
      totalScore: 0,
      priorityLevel: 'Low',
      evaluatedAt: new Date(),
      evaluatedBy: 'System'
    };
  }

  getEvaluationByIdeaId(_ideaId: string): EvaluationScore | undefined {
    return undefined;
  }

  getStatistics(): Record<PriorityLevel, number> {
    return {
      'Critical': 0,
      'High': 0,
      'Medium': 0,
      'Low': 0
    };
  }
}
