import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { EmailRepository } from './email.repository.js';

export interface SendEmailInput {
  id_pengajuan: number | null;
  to_email: string;
  template: string;
  subject: string;
  text: string;
}

export interface SendEmailResult {
  status: 'SENT' | 'FAILED';
  error?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: Transporter;
  private readonly from: string;
  private readonly logsOnly: boolean;

  constructor(
    private readonly config: ConfigService,
    private readonly repository: EmailRepository,
  ) {
    this.from =
      this.config.get<string>('MAIL_FROM') ?? 'no-reply@smartbooking.local';
    const host = this.config.get<string>('MAIL_HOST');
    this.logsOnly = !host;

    this.transporter = host
      ? nodemailer.createTransport({
          host,
          port: this.config.get<number>('MAIL_PORT') ?? 587,
          secure: (this.config.get<number>('MAIL_PORT') ?? 587) === 465,
          auth: this.config.get<string>('MAIL_USER')
            ? {
                user: this.config.get<string>('MAIL_USER'),
                pass: this.config.get<string>('MAIL_PASSWORD'),
              }
            : undefined,
        })
      : nodemailer.createTransport({ jsonTransport: true });
  }

  async send(input: SendEmailInput): Promise<SendEmailResult> {
    let logId: number;
    try {
      logId = await this.repository.create({
        id_pengajuan: input.id_pengajuan,
        to_email: input.to_email,
        template: input.template,
      });
    } catch (error) {
      this.logger.error(
        `Tidak dapat mencatat outbox email: ${describeError(error)}`,
      );
      return { status: 'FAILED', error: describeError(error) };
    }

    try {
      await this.transporter.sendMail({
        from: this.from,
        to: input.to_email,
        subject: input.subject,
        text: input.text,
      });
      await this.repository.markSent(logId);
      if (this.logsOnly) {
        this.logger.log(
          `[email lokal] ${input.template} -> ${input.to_email}\n${input.text}`,
        );
      }
      return { status: 'SENT' };
    } catch (error) {
      const message = describeError(error);
      try {
        await this.repository.markFailed(logId, message);
      } catch (logError) {
        this.logger.error(
          `Tidak dapat menandai email ${logId} gagal: ${describeError(logError)}`,
        );
      }
      this.logger.warn(
        `Email ${input.template} ke ${input.to_email} gagal: ${message}`,
      );
      return { status: 'FAILED', error: message };
    }
  }
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
