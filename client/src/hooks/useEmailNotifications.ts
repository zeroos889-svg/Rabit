import { useState, useCallback } from 'react';
import { toast } from '@/lib/toast';

interface EmailTemplate {
  id: string;
  name: string;
  nameAr: string;
  subject: string;
  subjectAr: string;
  body: string;
  bodyAr: string;
  variables: string[];
}

interface SendEmailOptions {
  to: string | string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  templateId?: string;
  variables?: Record<string, string>;
  attachments?: File[];
  priority?: 'low' | 'normal' | 'high';
  scheduledAt?: Date;
}

interface EmailLog {
  id: string;
  to: string[];
  subject: string;
  status: 'pending' | 'sent' | 'failed' | 'scheduled';
  sentAt?: Date;
  error?: string;
}

// Built-in email templates
const emailTemplates: EmailTemplate[] = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    nameAr: 'رسالة ترحيب',
    subject: 'Welcome to {{companyName}}!',
    subjectAr: 'مرحباً بك في {{companyName}}!',
    body: `Dear {{employeeName}},

Welcome to {{companyName}}! We're excited to have you join our team.

Your start date is {{startDate}} and you'll be reporting to {{managerName}}.

Please complete your onboarding tasks in the HR portal.

Best regards,
HR Team`,
    bodyAr: `عزيزي {{employeeName}}،

مرحباً بك في {{companyName}}! نحن متحمسون لانضمامك إلى فريقنا.

تاريخ بدء عملك هو {{startDate}} وستكون تحت إشراف {{managerName}}.

يرجى إكمال مهام التأهيل في بوابة الموارد البشرية.

مع أطيب التحيات،
فريق الموارد البشرية`,
    variables: ['employeeName', 'companyName', 'startDate', 'managerName'],
  },
  {
    id: 'leave-approval',
    name: 'Leave Approval',
    nameAr: 'الموافقة على الإجازة',
    subject: 'Leave Request {{status}}',
    subjectAr: 'طلب الإجازة {{status}}',
    body: `Dear {{employeeName}},

Your leave request from {{startDate}} to {{endDate}} has been {{status}}.

{{#if comments}}
Comments: {{comments}}
{{/if}}

Best regards,
{{approverName}}`,
    bodyAr: `عزيزي {{employeeName}}،

تم {{status}} طلب إجازتك من {{startDate}} إلى {{endDate}}.

{{#if comments}}
ملاحظات: {{comments}}
{{/if}}

مع أطيب التحيات،
{{approverName}}`,
    variables: ['employeeName', 'startDate', 'endDate', 'status', 'comments', 'approverName'],
  },
  {
    id: 'payslip',
    name: 'Payslip Notification',
    nameAr: 'إشعار كشف الراتب',
    subject: 'Your Payslip for {{month}} {{year}}',
    subjectAr: 'كشف راتبك لشهر {{month}} {{year}}',
    body: `Dear {{employeeName}},

Your payslip for {{month}} {{year}} is now available in the HR portal.

Net Salary: {{netSalary}}

Login to view the details.

Best regards,
Finance Team`,
    bodyAr: `عزيزي {{employeeName}}،

كشف راتبك لشهر {{month}} {{year}} متاح الآن في بوابة الموارد البشرية.

صافي الراتب: {{netSalary}}

قم بتسجيل الدخول لعرض التفاصيل.

مع أطيب التحيات،
الفريق المالي`,
    variables: ['employeeName', 'month', 'year', 'netSalary'],
  },
  {
    id: 'performance-review',
    name: 'Performance Review Reminder',
    nameAr: 'تذكير بمراجعة الأداء',
    subject: 'Performance Review Scheduled',
    subjectAr: 'موعد مراجعة الأداء',
    body: `Dear {{employeeName}},

Your performance review has been scheduled for {{reviewDate}} at {{reviewTime}}.

Reviewer: {{reviewerName}}
Location: {{location}}

Please prepare your self-assessment beforehand.

Best regards,
HR Team`,
    bodyAr: `عزيزي {{employeeName}}،

تم تحديد موعد مراجعة أدائك في {{reviewDate}} الساعة {{reviewTime}}.

المراجع: {{reviewerName}}
المكان: {{location}}

يرجى إعداد التقييم الذاتي مسبقاً.

مع أطيب التحيات،
فريق الموارد البشرية`,
    variables: ['employeeName', 'reviewDate', 'reviewTime', 'reviewerName', 'location'],
  },
  {
    id: 'interview-invitation',
    name: 'Interview Invitation',
    nameAr: 'دعوة للمقابلة',
    subject: 'Interview Invitation - {{position}}',
    subjectAr: 'دعوة للمقابلة - {{position}}',
    body: `Dear {{candidateName}},

We're pleased to invite you for an interview for the {{position}} position at {{companyName}}.

Date: {{interviewDate}}
Time: {{interviewTime}}
Location: {{location}}
Interviewer: {{interviewerName}}

Please confirm your attendance.

Best regards,
{{recruiterName}}
Recruitment Team`,
    bodyAr: `عزيزي {{candidateName}}،

يسرنا دعوتك لإجراء مقابلة لمنصب {{position}} في {{companyName}}.

التاريخ: {{interviewDate}}
الوقت: {{interviewTime}}
المكان: {{location}}
المقابل: {{interviewerName}}

يرجى تأكيد حضورك.

مع أطيب التحيات،
{{recruiterName}}
فريق التوظيف`,
    variables: ['candidateName', 'position', 'companyName', 'interviewDate', 'interviewTime', 'location', 'interviewerName', 'recruiterName'],
  },
];

export function useEmailNotifications() {
  const [isSending, setIsSending] = useState(false);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);

  // Get all templates
  const getTemplates = useCallback(() => emailTemplates, []);

  // Get template by ID
  const getTemplate = useCallback((templateId: string) => {
    return emailTemplates.find(t => t.id === templateId);
  }, []);

  // Replace template variables
  const replaceVariables = useCallback((
    text: string,
    variables: Record<string, string>
  ): string => {
    let result = text;
    Object.entries(variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return result;
  }, []);

  // Send email
  const sendEmail = useCallback(async (options: SendEmailOptions): Promise<boolean> => {
    setIsSending(true);
    
    try {
      let subject = options.subject;
      let body = options.body;

      // If using template, get and process it
      if (options.templateId && options.variables) {
        const template = getTemplate(options.templateId);
        if (template) {
          subject = replaceVariables(template.subject, options.variables);
          body = replaceVariables(template.body, options.variables);
        }
      }

      // Prepare recipients
      const recipients = Array.isArray(options.to) ? options.to : [options.to];

      // Create email log entry
      const logEntry: EmailLog = {
        id: Date.now().toString(),
        to: recipients,
        subject,
        status: options.scheduledAt ? 'scheduled' : 'pending',
        sentAt: options.scheduledAt,
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In production, this would call the actual email API
      // const response = await fetch('/api/email/send', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     to: recipients,
      //     cc: options.cc,
      //     bcc: options.bcc,
      //     subject,
      //     body,
      //     priority: options.priority || 'normal',
      //     scheduledAt: options.scheduledAt,
      //   }),
      // });

      logEntry.status = 'sent';
      logEntry.sentAt = new Date();
      
      setEmailLogs(prev => [logEntry, ...prev]);

      toast.success('تم إرسال البريد الإلكتروني', {
        description: `تم الإرسال إلى ${recipients.length} مستلم`,
      });

      return true;
    } catch (error) {
      const logEntry: EmailLog = {
        id: Date.now().toString(),
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      
      setEmailLogs(prev => [logEntry, ...prev]);

      toast.error('فشل إرسال البريد الإلكتروني', {
        description: logEntry.error,
      });

      return false;
    } finally {
      setIsSending(false);
    }
  }, [getTemplate, replaceVariables]);

  // Send bulk emails
  const sendBulkEmails = useCallback(async (
    recipients: string[],
    subject: string,
    body: string,
    variables?: Record<string, Record<string, string>>
  ): Promise<{ success: number; failed: number }> => {
    let success = 0;
    let failed = 0;

    for (const recipient of recipients) {
      const recipientVariables = variables?.[recipient] || {};
      const result = await sendEmail({
        to: recipient,
        subject: replaceVariables(subject, recipientVariables),
        body: replaceVariables(body, recipientVariables),
      });

      if (result) {
        success++;
      } else {
        failed++;
      }
    }

    return { success, failed };
  }, [sendEmail, replaceVariables]);

  // Send template email
  const sendTemplateEmail = useCallback(async (
    templateId: string,
    to: string | string[],
    variables: Record<string, string>,
    options?: Partial<SendEmailOptions>
  ): Promise<boolean> => {
    const template = getTemplate(templateId);
    if (!template) {
      toast.error('خطأ', {
        description: 'القالب غير موجود',
      });
      return false;
    }

    return sendEmail({
      to,
      subject: template.subject,
      body: template.body,
      templateId,
      variables,
      ...options,
    });
  }, [getTemplate, sendEmail]);

  // Schedule email
  const scheduleEmail = useCallback(async (
    options: SendEmailOptions,
    scheduledAt: Date
  ): Promise<boolean> => {
    return sendEmail({
      ...options,
      scheduledAt,
    });
  }, [sendEmail]);

  // Get email logs
  const getLogs = useCallback((filters?: {
    status?: EmailLog['status'];
    from?: Date;
    to?: Date;
  }) => {
    let logs = [...emailLogs];

    if (filters?.status) {
      logs = logs.filter(log => log.status === filters.status);
    }

    if (filters?.from) {
      logs = logs.filter(log => 
        log.sentAt && new Date(log.sentAt) >= filters.from!
      );
    }

    if (filters?.to) {
      logs = logs.filter(log => 
        log.sentAt && new Date(log.sentAt) <= filters.to!
      );
    }

    return logs;
  }, [emailLogs]);

  return {
    // State
    isSending,
    emailLogs,
    
    // Template functions
    getTemplates,
    getTemplate,
    replaceVariables,
    
    // Send functions
    sendEmail,
    sendBulkEmails,
    sendTemplateEmail,
    scheduleEmail,
    
    // Log functions
    getLogs,
  };
}

export type { EmailTemplate, SendEmailOptions, EmailLog };
export default useEmailNotifications;
