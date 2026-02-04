import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  const porta = process.env.PORTA || 3333;
  await app.listen(porta);
  return porta;
}

bootstrap().then((porta) => {
  console.log(`API rodando em http://localhost:${porta}`);
});
