import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OnboardingDto } from './dto/onboarding.dto';
import { clerkClient } from 'src/clerk/clerk-client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByClerkId(clerkId: string) {
    const user = await this.prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async completeOnboarding(clerkId: string, data: OnboardingDto) {
    const user = await this.prisma.user.update({
        where: { clerkId },
        data: {
            companyName: data.companyName,
            category: data.category,
            address: data.address,
            onboardingComplete: true,
        },
    });

    await clerkClient.users.updateUser(clerkId, {
        publicMetadata: {
            onboardingComplete: true,
        },
    });

    return user;
  }
}
