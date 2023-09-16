import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import configuration from './config/configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.enableCors({
    origin: [
      'http://kpd.nomoredomainsrocks.ru',
      'https://kpd.nomoredomainsrocks.ru',
    ],
  });
  await app.listen(configuration().server.port);
}
bootstrap();
