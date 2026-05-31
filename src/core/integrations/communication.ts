import nodemailer from 'nodemailer';

export interface OutgoingMessage {
  id: string;
  type: 'EMAIL' | 'SMS' | 'LINKEDIN';
  to: string;
  subject?: string;
  body: string;
  sentAt: string;
  status: 'SENT' | 'FAILED';
}

export class CommunicationAdapter {
  private static outbox: OutgoingMessage[] = [];
  public static simulateCarrierFailure = false;

  public static async sendEmail(to: string, subject: string, body: string): Promise<OutgoingMessage> {
    if (this.simulateCarrierFailure) {
      throw new Error('SMTP Error: 550 Recipient address rejected (Twilio SendGrid reputation block)');
    }

    const msg: OutgoingMessage = {
      id: `msg-em-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type: 'EMAIL',
      to,
      subject,
      body,
      sentAt: new Date().toISOString(),
      status: 'SENT'
    };

    // --- Automatic SMTP upgrade if Gmail App Password credentials exist ---
    const gmailUser = process.env.GMAIL_USER || process.env.NEXT_PUBLIC_GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASS || process.env.NEXT_PUBLIC_GMAIL_APP_PASS;
    const gmailLive = process.env.GMAIL_SMTP_LIVE === 'true' || process.env.NEXT_PUBLIC_GMAIL_SMTP_LIVE === 'true';

    if (gmailUser && gmailPass && gmailLive) {
      try {
        console.log(`[CommunicationAdapter] Attempting real SMTP email dispatch to ${to} via Gmail...`);
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: gmailUser,
            pass: gmailPass
          }
        });

        await transporter.sendMail({
          from: `"Cocktail Stix Wholesale" <${gmailUser}>`,
          to,
          subject,
          text: body
        });

        console.log(`[CommunicationAdapter] Real SMTP email successfully sent to ${to}!`);
      } catch (err: any) {
        console.error(`[CommunicationAdapter] Real SMTP dispatch failed: ${err.message}. Falling back to simulation mode logging.`);
      }
    } else {
      const lockMsg = !gmailLive && (gmailUser && gmailPass)
        ? `GMAIL_SMTP_LIVE is not set to true. Safety lock active.`
        : `Configure GMAIL_USER and GMAIL_APP_PASS to send real emails.`;
      console.log(`[CommunicationAdapter] Sandbox mode: logged simulated email to ${to} in outbox. (${lockMsg})`);
    }

    this.outbox.push(msg);
    return msg;
  }

  public static async sendSMS(to: string, body: string): Promise<OutgoingMessage> {
    if (this.simulateCarrierFailure) {
      throw new Error('Twilio Error: 21614 SMS Send Rate Exceeded or Carrier Unreachable');
    }

    const msg: OutgoingMessage = {
      id: `msg-sms-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type: 'SMS',
      to,
      body,
      sentAt: new Date().toISOString(),
      status: 'SENT'
    };

    this.outbox.push(msg);
    return msg;
  }

  public static async sendLinkedIn(profileUrl: string, body: string): Promise<OutgoingMessage> {
    const msg: OutgoingMessage = {
      id: `msg-li-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type: 'LINKEDIN',
      to: profileUrl,
      body,
      sentAt: new Date().toISOString(),
      status: 'SENT'
    };

    this.outbox.push(msg);
    return msg;
  }

  public static getOutbox(): OutgoingMessage[] {
    return this.outbox;
  }

  public static clearOutbox(): void {
    this.outbox = [];
  }
}
