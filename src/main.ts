import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { clerkMiddleware } from '@clerk/express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    clerkMiddleware({
      authorizedParties: ['http://localhost:3000'],
    }),
  );

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
