import { supabase } from '../lib/supabase';
import { AuditLog, AuditAction } from '../models';

export class AuditService {
  async log(ideaId: string, action: AuditAction, performedBy: string, details: string): Promise<AuditLog | null> {
    try {
      const now = new Date().toISOString();
      const log_id = `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      
      const { data, error } = await supabase
        .from('audit_logs')
        .insert({
          log_id: log_id,
          idea_id: ideaId,
          action: action,
          performed_by: performedBy,
          details: details,
          performed_at: now,
          submitted_date: now
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase Audit Log Error:', error);
        return null;
      }

      return data ? this.mapToLog(data) : null;
    } catch (err) {
      console.error('Audit Log Exception:', err);
      return null;
    }
  }

  async getLogsByIdeaId(ideaId: string): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('idea_id', ideaId)
      .order('performed_at', { ascending: false });

    if (error) {
      console.error('Error fetching logs:', error);
      return [];
    }

    return (data || []).map(item => this.mapToLog(item));
  }

  async getAllLogs(): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('performed_at', { ascending: false });

    if (error) {
      console.error('Error fetching all logs:', error);
      return [];
    }

    return (data || []).map(item => this.mapToLog(item));
  }

  private mapToLog(item: any): AuditLog {
    if (!item) return {} as AuditLog;
    return {
      id: item.log_id || item.id || `temp-${Math.random()}`,
      ideaId: item.idea_id || '',
      action: (item.action as AuditAction) || 'Updated',
      performedBy: item.performed_by || 'System',
      performedAt: (() => {
        const dateStr = item.performed_at || item.submitted_date;
        if (!dateStr) return new Date();
        const isoStr = dateStr.includes('Z') || dateStr.includes('+') ? dateStr : `${dateStr.replace(' ', 'T')}Z`;
        return new Date(isoStr);
      })(),
      details: item.details || ''
    };
  }
}
