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

    // Trigger Power Automate Workflow
    try {
      const webhookUrl = import.meta.env.VITE_POWER_AUTOMATE_WEBHOOK_URL;
      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idea_id: id,
            title: data.title,
            description: data.description,
            submitter_email: data.submitterEmail,
            submitter_name: `${data.submitterFirstName} ${data.submitterLastName}`,
            department: data.department,
            submission_date: new Date().toISOString()
          }),
        });
        console.log('Power Automate webhook triggered successfully');
      } else {
        console.warn('VITE_POWER_AUTOMATE_WEBHOOK_URL is not set');
      }
    } catch (err) {
      console.error('Failed to trigger Power Automate webhook:', err);
    
    }

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

  async getReviewers(): Promise<string[]> {
    const { data, error } = await supabase
      .from('ideas')
      .select('reviewed_by');
    
    if (error) {
      console.error('Error fetching reviewers:', error);
      return ['Paul', 'Lester'];
    }

    const reviewers = new Set(['Paul', 'Lester']);
    data?.forEach((item: any) => {
      if (item.reviewed_by) reviewers.add(item.reviewed_by);
    });

    return Array.from(reviewers).sort();
  }

  async updateIdeaStatus(
    id: string,
    status: IdeaStatus,
    reviewData: {
      classification?: any;
      priority?: number;
      remarks?: string;
      reviewedBy?: string;
    },
    performedBy: string = 'Admin'
  ): Promise<boolean> {
    const updateData: any = {
      status,
      classification: reviewData.classification || null,
      admin_remarks: reviewData.remarks || null,
      reviewed_by: reviewData.reviewedBy || null
    };
    
    // Only set priority if it's explicitly provided and valid (1-4)
    // Otherwise set to null to ensure "Not selected" state
    if (reviewData.priority && reviewData.priority >= 1 && reviewData.priority <= 4) {
      updateData.priority = reviewData.priority;
    } else {
      updateData.priority = null;
    }

    const { error } = await supabase
      .from('ideas')
      .update(updateData)
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
      const priorityLabel = reviewData.priority === 4 ? 'Critical' : reviewData.priority === 3 ? 'High' : reviewData.priority === 2 ? 'Medium' : 'Low';
      details = `Idea has been approved for implementation. Classification: ${reviewData.classification || 'N/A'}, Priority: ${priorityLabel}`;
    } else if (status === 'Rejected') {
      action = 'Rejected';
      details = `Idea has been rejected. Remarks: ${reviewData.remarks || 'None'}`;
    } else if (reviewData.classification || reviewData.priority) {
      action = 'Updated';
      const priorityLabel = reviewData.priority ? (reviewData.priority === 4 ? 'Critical' : reviewData.priority === 3 ? 'High' : reviewData.priority === 2 ? 'Medium' : 'Low') : '';
      details = `Idea details updated - Classification: ${reviewData.classification || 'N/A'}${reviewData.priority ? `, Priority: ${priorityLabel}` : ''}`;
    }

    const auditService = new AuditService();
    await auditService.log(id, action, reviewData.reviewedBy || performedBy, details);

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

      // By Priority - Only count for Approved ideas
      if (idea.priority && idea.status === 'Approved') {
        if (idea.priority === 4) stats.evaluationStats.Critical++;
        else if (idea.priority === 3) stats.evaluationStats.High++;
        else if (idea.priority === 2) stats.evaluationStats.Medium++;
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
      adminRemarks: item.admin_remarks,
      reviewedBy: item.reviewed_by
    };
  }
}
