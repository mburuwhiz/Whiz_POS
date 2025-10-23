import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // This port should be different from the old server's port to run in parallel
  await app.listen(4001);
  console.log(`New NestJS server is running on: http://localhost:4001`);
}
bootstrap();
