import { Injectable, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { WebhookEvent } from '@clerk/backend';
import { Request } from 'express';
import { Webhook } from 'svix';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WebhooksService {
  constructor(private usersService: UsersService, private configService: ConfigService) {}
  async processEvent(
    svixId: string,
    svixTimestamp: string,
    svixSignature: string,
    request: Request & { rawBody?: Buffer },
  ) {
    if (!svixId || !svixTimestamp || !svixSignature) {
      throw new BadRequestException('Missing svix headers');
    }

    const payload = request.rawBody;

    if (!payload) {
      throw new BadRequestException('Missing request body');
    }

    const webhookSecret = this.configService.get<string>('CLERK_WEBHOOK_SECRET') || '';
    const wh = new Webhook(webhookSecret);
    let evt: WebhookEvent;

    try {
      evt = wh.verify(payload.toString(), {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as WebhookEvent;
    } catch (err) {
      console.error('Webhook verification failed:', err);

      throw new BadRequestException('Invalid signature');
    }

    const eventType = evt.type;

    if (eventType === 'user.created') {
      await this.createUserFromWebhook(evt);
    } else if (eventType === 'user.updated') {
      await this.updateUserFromWebhook(evt);
    } else if (eventType === 'user.deleted') {
      await this.deleteUserFromWebhook(evt);
    }
  }

  private async createUserFromWebhook(evt: WebhookEvent) {
    if (evt.type !== 'user.created') return;

    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    await this.usersService.createFromWebhook({
      clerkId: id,
      email: email_addresses[0]?.email_address ?? '',
      firstName: first_name ?? '',
      lastName: last_name ?? '',
      imageUrl: image_url ?? '',
    });
  }

  private async updateUserFromWebhook(evt: WebhookEvent) {
    if (evt.type !== 'user.updated') return;

    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    await this.usersService.updateFromWebhook(id, {
      email: email_addresses[0]?.email_address ?? '',
      firstName: first_name ?? '',
      lastName: last_name ?? '',
      imageUrl: image_url ?? '',
    });
  }

  private async deleteUserFromWebhook(evt: WebhookEvent) {
    if (evt.type !== 'user.deleted') return;

    const { id } = evt.data;
    if (id) {
      await this.usersService.softDeleteFromWebhook(id);
    }
  }
}
