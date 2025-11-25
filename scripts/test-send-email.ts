/**
 * Lightweight email send test script.
 * Usage:
 *   RESEND_API_KEY=xxxx SMTP_HOST=... SMTP_PORT=... SMTP_USER=... SMTP_PASS=... \
 *   RESEND_TEST_TO=recipient@example.com node scripts/test-send-email.ts
 *
 * No console.* calls per project policy. Writes minimal structured output to stdout/stderr.
 */
import { sendEmailDetailed, SendEmailResult } from '../server/_core/email.js';

// Read environment without leaking secrets
const toEnv = process.env.RESEND_TEST_TO || process.env.SMTP_TEST_TO;
const apiKeyPresent = !!process.env.RESEND_API_KEY;

if (!toEnv) {
  process.stderr.write('Missing RESEND_TEST_TO (or SMTP_TEST_TO) env variable.\n');
  process.exit(1);
}

async function main() {
  const subject = '[Email Test] RabitHR provider chain check';
  const html = `<p>This is a test email to validate provider chain at ${new Date().toISOString()}.</p>`;
  try {
  const recipient: string = toEnv!; // non-null after earlier guard
    const result: SendEmailResult = await sendEmailDetailed({
      to: recipient,
      subject,
      html,
      // legacy fields not required: template/userId
    });
    // Structured machine-readable line (JSON) for easy parsing.
  process.stdout.write(JSON.stringify({ ok: true, provider: result.provider, id: result.id, timestamp: result.timestamp, apiKeyPresent }) + '\n');
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    process.stderr.write(JSON.stringify({ ok: false, errorMessage }) + '\n');
    process.exit(2);
  }
}

main();
