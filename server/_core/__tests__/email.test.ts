import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import type { SendEmailResult } from '../email';

// Mock dependencies before imports
const resendCtorMock = vi.fn();
const resendSendMock = vi.fn();

class ResendMock {
  emails = { send: resendSendMock };
  constructor(...args: unknown[]) {
    resendCtorMock(...args);
  }
}

const createTransportMock = vi.fn();
const sendMailMock = vi.fn();

vi.mock('resend', () => ({
  Resend: ResendMock
}));

vi.mock('nodemailer', () => ({
  default: {
    createTransport: createTransportMock
  }
}));

// Mock logger to silence output
vi.mock('../logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  },
  logEmailProviderEvent: vi.fn()
}));

// Mock db module
vi.mock('../../db/index', () => ({
  logEmail: vi.fn().mockResolvedValue(undefined)
}));

beforeEach(() => {
  vi.clearAllMocks();
  resendCtorMock.mockReset();
  resendSendMock.mockReset();
  createTransportMock.mockReset();
  sendMailMock.mockReset();
  process.env.LOG_SILENT = 'true';
  delete process.env.RESEND_API_KEY;
  delete process.env.SMTP_HOST;
  delete process.env.SMTP_PORT;
  delete process.env.SMTP_USER;
  delete process.env.SMTP_PASSWORD;
  delete process.env.SMTP_FROM;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Email Provider Chain', () => {
  it('should use Resend when RESEND_API_KEY is present and succeeds', async () => {
    process.env.RESEND_API_KEY = 'test-key';
    process.env.SMTP_FROM = 'test@example.com';
    
    // Mock successful Resend response
    resendSendMock.mockResolvedValue({ id: 'msg_resend_1' });

    const { sendEmailDetailed } = await import('../email');
    const result: SendEmailResult = await sendEmailDetailed({ 
      to: 'user@example.com', 
      subject: 'Test', 
      html: '<p>Hi</p>' 
    });
    
    expect(result.success).toBe(true);
    expect(result.provider).toBe('resend');
    expect(result.id).toBe('msg_resend_1');
  });

  it('should fall back to SMTP when Resend fails', async () => {
    process.env.RESEND_API_KEY = 'test-key';
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'user';
    process.env.SMTP_PASSWORD = 'pass';
    process.env.SMTP_FROM = 'no-reply@example.com';
    
    // Mock Resend failure
    resendSendMock.mockRejectedValue(new Error('Resend down'));

    // Mock SMTP success
    sendMailMock.mockResolvedValue({ messageId: 'smtp-123' });
    createTransportMock.mockReturnValue({ sendMail: sendMailMock });

    const { sendEmailDetailed } = await import('../email');
    const result: SendEmailResult = await sendEmailDetailed({ 
      to: 'user@example.com', 
      subject: 'Fallback', 
      html: '<p>Fallback</p>' 
    });
    
    expect(result.success).toBe(true);
    expect(result.provider).toBe('smtp');
    expect(result.errorMessage).toBeUndefined();
  });

  it('should report failure when both providers fail', async () => {
    process.env.RESEND_API_KEY = 'test-key';
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'user';
    process.env.SMTP_PASSWORD = 'pass';
    process.env.SMTP_FROM = 'no-reply@example.com';
    
    // Mock Resend failure
    resendSendMock.mockRejectedValue(new Error('Resend down'));

    // Mock SMTP failure
    sendMailMock.mockRejectedValue(new Error('SMTP down'));
    createTransportMock.mockReturnValue({ sendMail: sendMailMock });

    const { sendEmailDetailed } = await import('../email');
    const result: SendEmailResult = await sendEmailDetailed({ 
      to: 'user@example.com', 
      subject: 'Fail', 
      html: '<p>Fail</p>' 
    });
    
    expect(result.success).toBe(false);
    expect(result.provider).toBe('smtp'); // Tried SMTP as fallback
    expect(result.errorMessage).toBeTruthy();
  });
});
