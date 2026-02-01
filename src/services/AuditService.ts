import { AuditLog, AuditAction } from '../models';

export class AuditService {
  log(ideaId: string, action: AuditAction, performedBy: string, details: string): AuditLog {
    return {
      id: `audit_${Date.now()}`,
      ideaId,
      action,
      performedBy,
      performedAt: new Date(),
      details
    };
  }

  getLogsByIdeaId(_ideaId: string): AuditLog[] {
    return [];
  }

  getAllLogs(): AuditLog[] {
    return [];
  }
}
