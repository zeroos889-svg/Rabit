# Email Provider Chain (Resend + SMTP Fallback)

## Overview

The application sends transactional emails (welcome, booking confirmation, response notification) using a provider chain:

1. Resend (primary) – activated when `RESEND_API_KEY` is present.
2. SMTP (fallback) – activated when `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM` are defined.
3. No provider – logs failure with reason.

Structured logging is persisted via `db.logEmail()` calls without using `console.*`, complying with lint rules.

## Result Object

The new `sendEmailDetailed()` returns:

```ts
interface SendEmailResult {
  success: boolean;
  provider: 'resend' | 'smtp' | 'none';
  id?: string;         // Provider message id if available
  timestamp: string;   // ISO time of completion
  errorMessage?: string; // Failure detail
}
```

Legacy `sendEmail()` still returns a boolean for backwards compatibility.

## Environment Variables

| Variable | Purpose |
|----------|---------|
| RESEND_API_KEY | Enables Resend primary provider |
| RESEND_TEST_TO | Target email address for test script |
| SMTP_HOST | SMTP server host (fallback) |
| SMTP_PORT | SMTP server port (e.g. 587) |
| SMTP_USER | SMTP auth user |
| SMTP_PASS | SMTP auth password |
| SMTP_FROM | From address used for both providers |

## Test Script

Use `scripts/test-send-email.ts` for manual verification:

```bash
export RESEND_API_KEY='rotated-key'
export RESEND_TEST_TO='you@example.com'
export SMTP_HOST='smtp.example.com'
export SMTP_PORT='587'
export SMTP_USER='user'
export SMTP_PASS='pass'
export SMTP_FROM='no-reply@rabit-hr.com'
node scripts/test-send-email.ts
```

Success output (stdout JSON):

```json
{"ok":true,"provider":"resend","id":"msg_123","timestamp":"2025-11-23T12:00:00.000Z","apiKeyPresent":true}
```

Failure output (stderr JSON):

```json
{"ok":false,"errorMessage":"RESEND_API_KEY not configured"}
```

## Rotation & Security

If an API key is ever committed accidentally:

1. Rotate key immediately in Resend dashboard.
2. Remove exposed key from commit history (`git filter-repo` or equivalent).
3. Redeploy with new secret only in environment variables or secret manager.

## Future Enhancements

- Centralized logger (winston) with structured JSON format.
- Queue & retry mechanism for transient SMTP failures.
- Template management system (handlebars or MJML).
- Metrics dashboard (success rate, latency per provider).

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| provider = none + errorMessage: "RESEND_API_KEY not configured" | Missing key | Set `RESEND_API_KEY` |
| provider = smtp but success=false | SMTP auth or network | Verify credentials & port/firewall |
| success=true provider=resend id undefined | Resend response changed / permission | Inspect raw response, update extraction logic |
| Repeated failures both providers | Network outage / DNS | Test outbound connectivity inside container |

## Docker Notes

Ensure the following are passed as environment variables when running the container:

```yaml
environment:
  RESEND_API_KEY: ${RESEND_API_KEY}
  SMTP_HOST: ${SMTP_HOST}
  SMTP_PORT: ${SMTP_PORT}
  SMTP_USER: ${SMTP_USER}
  SMTP_PASS: ${SMTP_PASS}
  SMTP_FROM: ${SMTP_FROM}
```
