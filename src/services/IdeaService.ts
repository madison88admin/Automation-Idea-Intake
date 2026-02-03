import { supabase } from '../lib/supabase';
import { Idea, IdeaStatus, Department, ExpectedBenefit, Country } from '../models';
import { AuditService } from './AuditService';

export class IdeaService {
  private generateId(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ2345789';
    let randomPart = '';
    for (let i = 0; i < 5; i++) {
        randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `AIT-${randomPart}`;
  }

  async submitIdea(data: {
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
  }): Promise<Idea | null> {
    const id = this.generateId();
    const insertData = {
      idea_id: id,
      title: data.title,
      idea_description: data.description,
      department: data.department,
      country: data.country,
      expected_benefit: data.expectedBenefit,
      frequency: data.frequency,
      submitter_name: `${data.submitterFirstName} ${data.submitterLastName}`,
      submitter_email: data.submitterEmail,
      current_process: data.currentProcessTitle,
      current_process_problem: data.currentProcessProblem,
      is_manual_process: data.isManualProcess,
      involves_multiple_departments: data.involvesMultipleDepartments,
      involved_departments: data.involvedDepartments,
      status: 'Submitted',
      date_submitted: new Date().toISOString()
    };

    console.log('Attempting to insert into Supabase:', insertData);

    const { data: idea, error } = await supabase
      .from('ideas')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Supabase Error during insert:', error);
      alert(`Submission failed: ${error.message}. Please check your database columns and RLS policies.`);
      return null;
    }

    // Log the creation activity
    const auditService = new AuditService();
    await auditService.log(
      id, 
      'Created', 
      `${data.submitterFirstName} ${data.submitterLastName}`,
      `Initial submission of "${data.title}"`
    );

    console.log('Successfully submitted:', idea);
    return this.mapToIdea(idea);
  }

  async getAllIdeas(): Promise<Idea[]> {
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .order('date_submitted', { ascending: false });

    if (error) {
      console.error('Error fetching ideas:', error);
      return [];
    }

    return data.map(item => this.mapToIdea(item));
  }

  async getIdeaById(id: string): Promise<Idea | null> {
    const { data, error } = await supabase
      .from('ideas')
      .select('*')
      .eq('idea_id', id)
      .single();

    if (error) {
      console.error('Error fetching idea:', error);
      return null;
    }

    return this.mapToIdea(data);
  }

  async updateIdeaStatus(
    id: string,
    status: IdeaStatus,
    reviewData: {
      classification?: any;
      priority?: number;
      remarks?: string;
    },
    performedBy: string = 'Admin'
  ): Promise<boolean> {
    const { error } = await supabase
      .from('ideas')
      .update({
        status,
        classification: reviewData.classification,
        priority: reviewData.priority,
        admin_remarks: reviewData.remarks
      })
      .eq('idea_id', id);

    if (error) {
      console.error('Error updating idea status:', error);
      return false;
    }

    // Capture specific action for audit
    let action: any = 'StatusChanged';
    let details = `Status updated to ${status}`;
    
    if (status === 'Approved') {
      action = 'Approved';
      details = 'Idea has been approved for implementation';
    } else if (status === 'Rejected') {
      action = 'Rejected';
      details = `Idea has been rejected. Remarks: ${reviewData.remarks || 'None'}`;
    } else if (reviewData.classification || reviewData.priority) {
      action = 'Updated';
      details = 'Idea details (classification/priority) updated';
    }

    const auditService = new AuditService();
    await auditService.log(id, action, performedBy, details);

    return true;
  }

  async getStatistics(filterCountry?: string) {
    const query = supabase.from('ideas').select('*');
    if (filterCountry) {
      query.eq('country', filterCountry);
    }

    const { data: filteredIdeas, error } = await query;

    if (error) {
      console.error('Error fetching statistics:', error);
      return null;
    }

    const stats = {
      total: filteredIdeas.length,
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

    filteredIdeas.forEach((item: any) => {
      const idea = this.mapToIdea(item);
      // By Status
      const statusKey = idea.status as keyof typeof stats.byStatus;
      if (stats.byStatus.hasOwnProperty(statusKey)) {
        stats.byStatus[statusKey]++;
      }

      // By Department
      stats.byDepartment[idea.department] = (stats.byDepartment[idea.department] || 0) + 1;

      // By Country
      stats.byCountry[idea.country] = (stats.byCountry[idea.country] || 0) + 1;

      // By Classification
      if (idea.classification) {
        if (stats.classificationStats.hasOwnProperty(idea.classification)) {
          stats.classificationStats[idea.classification as keyof typeof stats.classificationStats]++;
        }
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

  private mapToIdea(item: any): Idea {
    const nameParts = item.submitter_name?.split(' ') || ['', ''];
    
    return {
      id: item.idea_id,
      title: item.title,
      description: item.idea_description, // Map from image name
      department: item.department,
      country: item.country || 'Unknown', // Default if missing in DB
      expectedBenefit: item.expected_benefit,
      frequency: item.frequency,
      submitterFirstName: nameParts[0],
      submitterLastName: nameParts.slice(1).join(' '),
      submitterEmail: item.submitter_email || '',
      dateSubmitted: item.date_submitted ? new Date(item.date_submitted.includes('Z') || item.date_submitted.includes('+') ? item.date_submitted : `${item.date_submitted}Z`) : new Date(),
      status: item.status || 'Submitted',
      currentProcessTitle: item.current_process, // Map from image name
      currentProcessProblem: item.current_process_problem,
      isManualProcess: item.is_manual_process,
      involvesMultipleDepartments: item.involves_multiple_departments,
      involvedDepartments: item.involved_departments || [],
      classification: item.classification,
      priority: item.priority,
      adminRemarks: item.admin_remarks
    };
  }
}
