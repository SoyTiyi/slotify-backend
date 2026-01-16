import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClerkClient, ClerkClient } from '@clerk/backend';

@Injectable()
export class ClerkService {
  private clerkClient: ClerkClient;

  constructor(private configService: ConfigService) {
    const secretKey = this.configService.get<string>('CLERK_SECRET_KEY');
    this.clerkClient = createClerkClient({ secretKey });
  }

  get users() {
    return this.clerkClient.users;
  }

  get client() {
    return this.clerkClient;
  }
}
