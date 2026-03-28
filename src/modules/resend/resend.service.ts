import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import type { CreateEmailOptions } from 'resend';

@Injectable()
export class ResendService {
  private readonly logger = new Logger(ResendService.name);
  private readonly client: Resend;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error(
        'Missing RESEND_API_KEY. Add it to .env (loaded from the project root on startup).',
      );
    }
    this.client = new Resend(apiKey);
  }

  async sendEmail(payload: CreateEmailOptions) {
    const { data, error } = await this.client.emails.send(payload);

    if (error) {
      this.logger.error(`Resend error: ${error.message}`);
      throw new Error(error.message);
    }

    return data;
  }
}
