/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

// import * as express from 'express';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // app.use('/uploads', express.static('uploads')); // manual static serving

  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true,
  });

  setupSwagger(app);

  await app.listen(process.env.PORT ?? 3000);
}

function setupSwagger(app) {
  // Document builder , Create document using swagger module , swagger module setup
  const config = new DocumentBuilder()
    .setTitle('Teamspace API')
    .setDescription('Workspace Chat Backend')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // ← token won't be lost on refresh
      tagsSorter: 'alpha', // ← tags alphabetically sort
      operationsSorter: 'alpha', // ← operations -  inner api alphabetically sort
    },
  });
}

bootstrap();
