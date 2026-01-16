import { Module } from '@nestjs/common';
import { WebhooksController } from './webhooks.controller';
import { UsersModule } from '../users/users.module';
import { WebhooksService } from './webhooks.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [UsersModule],
  controllers: [WebhooksController],
  providers: [WebhooksService, ConfigService]
})
export class WebhooksModule {}
