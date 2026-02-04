import emailjs from '@emailjs/browser';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export class EmailService {
  async sendConfirmationEmail(params: {
    referenceId: string;
    submitterName: string;
    submitterEmail: string;
    ideaTitle: string;
    department: string;
    dateSubmitted: string;
  }): Promise<boolean> {
    try {
      await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        {
          to_name: params.submitterName,
          to_email: params.submitterEmail,
          reference_id: params.referenceId,
          idea_title: params.ideaTitle,
          department: params.department,
          date_submitted: params.dateSubmitted,
        },
        PUBLIC_KEY
      );
      console.log('Confirmation email sent to:', params.submitterEmail);
      return true;
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
      return false;
    }
  }
}
