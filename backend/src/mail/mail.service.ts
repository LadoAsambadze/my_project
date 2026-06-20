import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

/**
 * Sends transactional email via Resend.
 *
 * In development you don't need a Resend account: if RESEND_API_KEY is unset
 * the code is logged to the console instead of emailed, so the verification
 * flow is fully testable locally without a domain. Set RESEND_API_KEY (and,
 * for real recipients, a verified domain in MAIL_FROM) to send for real.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly resend: Resend | null;
  private readonly from: string;

  constructor(private readonly config: ConfigService) {
    const apiKey = config.get<string>('RESEND_API_KEY');
    this.resend = apiKey ? new Resend(apiKey) : null;
    // Until you verify your own domain, Resend allows sending from
    // onboarding@resend.dev to your own account email.
    this.from =
      config.get<string>('MAIL_FROM') || 'Event <onboarding@resend.dev>';

    if (!this.resend) {
      this.logger.warn(
        'RESEND_API_KEY not set — verification codes will be logged to the console instead of emailed.',
      );
    }
  }

  async sendVerificationCode(to: string, code: string): Promise<void> {
    await this.send(
      to,
      'Your Event verification code',
      codeEmailHtml('Confirm your email', 'finish creating your Event account', code),
      `Your Event verification code is ${code}. It expires in 15 minutes.`,
      `Verification code for ${to}`,
    );
  }

  async sendPasswordResetCode(to: string, code: string): Promise<void> {
    await this.send(
      to,
      'Your Event password reset code',
      codeEmailHtml('Reset your password', 'reset your Event password', code),
      `Your Event password reset code is ${code}. It expires in 15 minutes.`,
      `Password reset code for ${to}`,
    );
  }

  async sendLoginCode(to: string, code: string): Promise<void> {
    await this.send(
      to,
      'Your Event sign-in code',
      codeEmailHtml('Sign in to Event', 'sign in to your Event account', code),
      `Your Event sign-in code is ${code}. It expires in 15 minutes.`,
      `Sign-in code for ${to}`,
    );
  }

  /** Send via Resend, or log to the console when no API key is configured. */
  private async send(
    to: string,
    subject: string,
    html: string,
    text: string,
    devLabel: string,
  ): Promise<void> {
    if (!this.resend) {
      this.logger.warn(`[DEV] ${devLabel}: ${text}`);
      return;
    }

    const { error } = await this.resend.emails.send({
      from: this.from,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      throw new Error('Failed to send email');
    }
  }
}

function codeEmailHtml(heading: string, purpose: string, code: string): string {
  return `
    <div style="font-family: system-ui, sans-serif; max-width: 420px; margin: 0 auto;">
      <h2 style="margin-bottom: 8px;">${heading}</h2>
      <p style="color: #555;">Enter this code to ${purpose}:</p>
      <p style="font-size: 32px; font-weight: 700; letter-spacing: 6px; margin: 16px 0;">${code}</p>
      <p style="color: #888; font-size: 13px;">This code expires in 15 minutes. If you didn't request it, you can ignore this email.</p>
    </div>
  `;
}
