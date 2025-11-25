/**
 * Type definitions for resend package
 * Temporary declarations until official types are fully resolved
 */

declare module 'resend' {
  export class Resend {
    constructor(_apiKey: string);
    
    emails: {
      send(_options: {
        from: string;
        to: string | string[];
        subject: string;
        html?: string;
        text?: string;
        reply_to?: string;
        cc?: string | string[];
        bcc?: string | string[];
        attachments?: Array<{
          filename: string;
          content: Buffer | string;
        }>;
      }): Promise<{
        id?: string;
        error?: {
          message: string;
          name: string;
        };
      }>;
    };
  }
}

