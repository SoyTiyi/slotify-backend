# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Slotify Backend is a NestJS application that provides backend services for the Slotify platform. The application uses:
- **NestJS** as the web framework
- **Prisma** as the ORM with PostgreSQL adapter
- **Clerk** for authentication and user management
- **TypeScript** with modern ES2023 features

## Development Commands

### Running the Application
```bash
npm run start:dev          # Development with hot-reload
npm run start:debug        # Development with debugger
npm run start              # Standard start
npm run start:prod         # Production mode
```

### Building
```bash
npm run build              # Compile TypeScript to dist/
```

### Testing
```bash
npm run test               # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage
npm run test:e2e           # Run end-to-end tests
npm run test:debug         # Run tests with debugger
```

### Code Quality
```bash
npm run lint               # Lint and auto-fix TypeScript files
npm run format             # Format code with Prettier
```

### Database
```bash
npx prisma migrate dev     # Create and apply migrations
npx prisma generate        # Generate Prisma client
npx prisma studio          # Open Prisma Studio GUI
npx prisma db push         # Push schema changes without migrations
```

## Architecture

### Authentication Flow
The application uses Clerk for authentication with a custom integration:

1. **Clerk Middleware** (`main.ts:8-12`): Applied globally to attach auth context to all requests
2. **ClerkAuthGuard** (`src/auth/clerk-auth.guard.ts`): NestJS guard to protect routes, checks `req.auth.isAuthenticated` and `req.auth.userId`
3. **ClerkUserId Decorator** (`src/auth/clerk-user.decorator.ts`): Extracts the authenticated user's Clerk ID from request context
4. **Clerk Client** (`src/clerk/clerk-client.ts`): Singleton instance for server-side Clerk API calls

When protecting a route:
```typescript
@UseGuards(ClerkAuthGuard)
@Get('profile')
getProfile(@ClerkUserId() userId: string) {
  // userId is the authenticated Clerk user ID
}
```

### Database Layer
- **Prisma Schema** (`prisma/schema.prisma`): Defines the User model with Clerk integration
- **Generated Client**: Located in `generated/prisma/` (gitignored), must regenerate after schema changes
- **PrismaService** (`src/prisma/prisma.service.ts`): Extends PrismaClient with custom PostgreSQL adapter configuration
- **PrismaModule**: Global module that provides PrismaService to the entire application

Key User model fields:
- `clerkId`: Unique identifier linking to Clerk user (indexed)
- `email`: User's email (indexed)
- `onboardingComplete`: Boolean flag for onboarding status
- `deletedAt`: Soft delete timestamp (null = active user)
- Onboarding data: `companyName`, `category`, `address`

### Module Structure
```
AppModule (root)
├── PrismaModule (global database access)
└── UsersModule
    ├── UsersController (API endpoints)
    └── UsersService (business logic)
```

### User Service Patterns
The UsersService (`src/users/users.service.ts`) implements several key patterns:

1. **Webhook Handlers**: Methods suffixed with `FromWebhook` handle Clerk webhook events
   - `createFromWebhook`: Upserts user on creation (handles duplicate events gracefully)
   - `updateFromWebhook`: Updates user profile data
   - `softDeleteFromWebhook`: Soft deletes user by setting `deletedAt`

2. **Onboarding Flow**:
   - `completeOnboarding`: Updates local DB and syncs `onboardingComplete` to Clerk's `publicMetadata`
   - Dual-write pattern: Updates both Prisma and Clerk to maintain consistency

3. **Service Pattern**: Always inject `PrismaService` via constructor for database access

### Type Safety
- Express types are extended in `src/types/express.d.ts` to include Clerk's auth object on requests
- All DTOs use `class-validator` for runtime validation
- TypeScript strict null checks enabled, but `noImplicitAny` disabled for flexibility

## Important Patterns

### Creating New Modules
1. Generate with NestJS CLI: `nest g module <name>`
2. Generate controller: `nest g controller <name>`
3. Generate service: `nest g service <name>`
4. Import the module in `AppModule` if needed for cross-module dependencies

### Database Changes
1. Update `prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name <description>`
3. Prisma client regenerates automatically during migration
4. If client doesn't regenerate: `npx prisma generate`

### Adding Protected Routes
```typescript
import { UseGuards } from '@nestjs/common';
import { ClerkAuthGuard } from 'src/auth/clerk-auth.guard';
import { ClerkUserId } from 'src/auth/clerk-user.decorator';

@Controller('resource')
export class ResourceController {
  @UseGuards(ClerkAuthGuard)
  @Get()
  findAll(@ClerkUserId() userId: string) {
    // userId is guaranteed to exist here
  }
}
```

### Webhook Integration Pattern
When handling Clerk webhooks, use the established pattern in UsersService:
1. Method names: `<action>FromWebhook`
2. Use upsert operations to handle duplicate events
3. Return the updated entity for webhook response

## Configuration

### Environment Variables
Required in `.env`:
- `PORT`: Server port (default: 3001)
- `DATABASE_URL`: PostgreSQL connection string
- `CLERK_PUBLISHABLE_KEY`: Clerk public key
- `CLERK_SECRET_KEY`: Clerk secret key for server-side operations

### TypeScript Configuration
- Module system: `nodenext` (ESM-compatible)
- Target: ES2023
- Decorators enabled for NestJS
- Base URL: `./` (allows `src/` imports)
- Output: `./dist`

## Notes

- The Clerk middleware in `main.ts` includes `authorizedParties: ['http://localhost:3000']` for CORS/security
- Prisma client output is customized to `../generated/prisma` instead of default location
- The app uses `@prisma/adapter-pg` for better PostgreSQL compatibility
- Recent commits show webhook integration: `createFromWebhook`, `updateFromWebhook`, `softDeleteFromWebhook`
