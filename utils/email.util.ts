import nodemailer from 'nodemailer';

/** Build the transporter once and reuse it across requests. */
const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT ?? '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error('SMTP configuration is incomplete. Check SMTP_HOST, SMTP_USER, SMTP_PASS in .env.local');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465 (SSL), false for 587 (TLS/STARTTLS)
    auth: { user, pass },
  });
};

// ─── HTML Templates ────────────────────────────────────────────────────────────

const baseTemplate = (title: string, body: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#0F4C69;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:0.5px;">
                Ambassador
              </h1>
              <p style="margin:4px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">
                Commercial Kitchen Equipment
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9f9f9;border-top:1px solid #eeeeee;padding:24px 40px;text-align:center;">
              <p style="margin:0;color:#999999;font-size:12px;line-height:1.6;">
                This email was sent by Ambassador commercial commercial Kitchen Equipment.<br/>
                If you did not request this, you can safely ignore it.
              </p>
              <p style="margin:12px 0 0;color:#cccccc;font-size:11px;">
                © ${new Date().getFullYear()} Ambassador commercial commercial Kitchen Equipment. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const otpBlock = (otp: string) => `
  <div style="margin:28px 0;text-align:center;">
    <div style="display:inline-block;background:#f0f7fa;border:2px dashed #0F4C69;
                border-radius:12px;padding:20px 48px;">
      <p style="margin:0 0 6px;color:#666666;font-size:13px;text-transform:uppercase;
                letter-spacing:1px;font-weight:600;">Your OTP Code</p>
      <p style="margin:0;font-size:42px;font-weight:700;letter-spacing:10px;color:#0F4C69;">
        ${otp}
      </p>
    </div>
    <p style="margin:16px 0 0;color:#999999;font-size:13px;">
      This code expires in <strong>10 minutes</strong>.
    </p>
  </div>
`;

// ─── Email Senders ─────────────────────────────────────────────────────────────

/**
 * Send the OTP verification email after registration.
 */
export const sendVerificationEmail = async (
  to: string,
  fullName: string,
  otp: string
): Promise<void> => {
  const transporter = createTransporter();
  const fromName = process.env.SMTP_FROM_NAME ?? 'Ambassador Kitchen Equipment';
  const fromEmail = process.env.SMTP_USER!;

  const body = `
    <h2 style="margin:0 0 8px;color:#1a1a1a;font-size:22px;font-weight:700;">
      Verify Your Email Address
    </h2>
    <p style="margin:0 0 20px;color:#555555;font-size:15px;line-height:1.7;">
      Hi <strong>${fullName}</strong>,<br/>
      Thank you for creating an account with Ambassador Kitchen Equipment.
      Use the OTP code below to verify your email address and complete your registration.
    </p>

    ${otpBlock(otp)}

    <p style="margin:24px 0 0;color:#555555;font-size:14px;line-height:1.7;">
      If you did not create an account, please ignore this email. No further action is required.
    </p>
  `;

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject: 'Verify Your Email — Ambassador Kitchen Equipment',
    html: baseTemplate('Email Verification', body),
  });
};

/**
 * Send account disabled notification email.
 */
export const sendAccountDisabledEmail = async (
  to: string,
  fullName: string,
  reason: string,
  description?: string
): Promise<void> => {
  const transporter = createTransporter();
  const fromName  = process.env.SMTP_FROM_NAME ?? 'Ambassador Kitchen Equipment';
  const fromEmail = process.env.SMTP_USER!;

  const reasonLabels: Record<string, string> = {
    policy_violation: 'Policy Violation',
    security_concern: 'Security Concern',
    inactivity:       'Inactivity',
    account_issue:    'Account Issue',
    other:            'Other',
  };

  const readableReason = reasonLabels[reason] ?? reason;

  const body = `
    <h2 style="margin:0 0 8px;color:#1a1a1a;font-size:22px;font-weight:700;">
      Your Account Has Been Disabled
    </h2>
    <p style="margin:0 0 20px;color:#555555;font-size:15px;line-height:1.7;">
      Hi <strong>${fullName}</strong>,<br/>
      We are writing to inform you that your account on <strong>Ambassador Kitchen Equipment</strong>
      has been temporarily disabled by our admin team.
    </p>

    <div style="background:#fff5f5;border-left:4px solid #ef4444;border-radius:8px;padding:16px 20px;margin:0 0 24px;">
      <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#b91c1c;text-transform:uppercase;letter-spacing:0.5px;">
        Reason
      </p>
      <p style="margin:0;font-size:15px;color:#1a1a1a;font-weight:600;">${readableReason}</p>
      ${description ? `<p style="margin:8px 0 0;font-size:14px;color:#555555;">${description}</p>` : ''}
    </div>

    <p style="margin:0 0 16px;color:#555555;font-size:14px;line-height:1.7;">
      While your account is disabled you will not be able to sign in. If you believe this is
      a mistake or would like to appeal, please contact our support team by replying to this
      email or reaching out at <a href="mailto:${fromEmail}" style="color:#0F4C69;">${fromEmail}</a>.
    </p>

    <p style="margin:0;color:#999999;font-size:13px;">
      — The Ambassador Kitchen Equipment Team
    </p>
  `;

  await transporter.sendMail({
    from:    `"${fromName}" <${fromEmail}>`,
    to,
    subject: 'Your Account Has Been Disabled — Ambassador Kitchen Equipment',
    html:    baseTemplate('Account Disabled', body),
  });
};

/**
 * Send account re-enabled notification email.
 */
export const sendAccountEnabledEmail = async (
  to: string,
  fullName: string
): Promise<void> => {
  const transporter = createTransporter();
  const fromName  = process.env.SMTP_FROM_NAME ?? 'Ambassador Kitchen Equipment';
  const fromEmail = process.env.SMTP_USER!;

  const body = `
    <h2 style="margin:0 0 8px;color:#1a1a1a;font-size:22px;font-weight:700;">
      Your Account Has Been Re-Enabled
    </h2>
    <p style="margin:0 0 20px;color:#555555;font-size:15px;line-height:1.7;">
      Hi <strong>${fullName}</strong>,<br/>
      Great news! Your account on <strong>Ambassador Kitchen Equipment</strong> has been
      re-enabled by our admin team. You can now sign in and access your account as usual.
    </p>

    <div style="margin:28px 0;text-align:center;">
      <a href="${process.env.NEXT_PUBLIC_BASE_URL ?? 'https://ambassador-blue.vercel.app'}/login"
        style="display:inline-block;background:#0F4C69;color:#ffffff;text-decoration:none;
               font-size:15px;font-weight:600;padding:14px 36px;border-radius:8px;
               letter-spacing:0.3px;">
        Sign In to Your Account
      </a>
    </div>

    <p style="margin:0;color:#555555;font-size:14px;line-height:1.7;">
      If you have any questions or concerns, feel free to reach out to our support team at
      <a href="mailto:${fromEmail}" style="color:#0F4C69;">${fromEmail}</a>.
    </p>
  `;

  await transporter.sendMail({
    from:    `"${fromName}" <${fromEmail}>`,
    to,
    subject: 'Your Account Has Been Re-Enabled — Ambassador Kitchen Equipment',
    html:    baseTemplate('Account Re-Enabled', body),
  });
};

/**
 * Send the password reset OTP email.
 */
export const sendPasswordResetEmail = async (
  to: string,
  fullName: string,
  otp: string
): Promise<void> => {
  const transporter = createTransporter();
  const fromName = process.env.SMTP_FROM_NAME ?? 'Ambassador Kitchen Equipment';
  const fromEmail = process.env.SMTP_USER!;

  const body = `
    <h2 style="margin:0 0 8px;color:#1a1a1a;font-size:22px;font-weight:700;">
      Password Reset Request
    </h2>
    <p style="margin:0 0 20px;color:#555555;font-size:15px;line-height:1.7;">
      Hi <strong>${fullName}</strong>,<br/>
      We received a request to reset your password. Use the OTP code below to proceed.
      This code is valid for <strong>10 minutes</strong>.
    </p>

    ${otpBlock(otp)}

    <p style="margin:24px 0 0;color:#555555;font-size:14px;line-height:1.7;">
      If you did not request a password reset, please ignore this email.
      Your password will remain unchanged.
    </p>
  `;

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject: 'Password Reset OTP — Ambassador Kitchen Equipment',
    html: baseTemplate('Password Reset', body),
  });
};
