import { Controller, Post, Headers, Req } from '@nestjs/common';
import { Request } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private webhooksService: WebhooksService) {}

  @Post('clerk')
  @Public()
  async handleClerkWebhook(
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTimestamp: string,
    @Headers('svix-signature') svixSignature: string,
    @Req() request: Request & { rawBody?: Buffer },
  ) {
    await this.webhooksService.processEvent(
      svixId,
      svixTimestamp,
      svixSignature,
      request,
    );

    return { success: true };
  }
}
