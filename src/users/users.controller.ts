import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { OnboardingDto } from './dto/onboarding.dto';
import { ClerkAuthGuard } from '../common/guards/clerk-auth.guard';
import { UserId } from '../common/decorators/user-id.decorator';

@Controller('users')
@UseGuards(ClerkAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getCurrentUser(@UserId() userId: string) {
    return this.usersService.findByClerkId(userId);
  }

  @Post('onboarding')
  async completeOnboarding(
    @UserId() userId: string,

    @Body() data: OnboardingDto,
  ) {
    return this.usersService.completeOnboarding(userId, data);
  }
}
