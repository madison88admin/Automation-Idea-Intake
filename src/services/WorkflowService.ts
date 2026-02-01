import { Workflow, WorkflowStatus } from '../models';

export class WorkflowService {
  createWorkflow(ideaId: string): Workflow {
    return {
      id: `wf_${Date.now()}`,
      ideaId,
      currentStatus: 'Submitted',
      assignedTo: 'Pending Assignment',
      remarks: '',
      decision: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  updateWorkflowStatus(_ideaId: string, _status: WorkflowStatus, _remarks: string): void {
    // No-op until Supabase is connected
  }

  assignReviewer(_ideaId: string, _reviewerName: string): void {
    // No-op until Supabase is connected
  }

  getWorkflowByIdeaId(_ideaId: string): Workflow | undefined {
    return undefined;
  }

  getAllWorkflows(): Workflow[] {
    return [];
  }
}
