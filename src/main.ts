import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const port: number = configService.get<number>('PORT', { infer: true });
  if (!port) {
    throw new Error('PORT is not defined');
  }

  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
}
bootstrap();
