import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  //Validate incoming request globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  //standardize error resposes
  app.useGlobalFilters(new HttpExceptionFilter());

  //Configure swagger docs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('quicklug API')
    .setDescription('API documentation for quicklug')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(
    app,
    swaggerConfig,
  );

  SwaggerModule.setup('docs', app, document);

  const port = Number(process.env.PORT) || 3000;

  await app.listen(port);

  console.log(`API: http://localhost:${port}`);

  console.log(`Swagger: http://localhost:${port}/docs`);
}
await bootstrap();
