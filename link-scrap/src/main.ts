import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ZodValidationPipe } from '@anatine/zod-nestjs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Global Zod validation pipe
  app.useGlobalPipes(new ZodValidationPipe());

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('LinkedIn BrightData API')
    .setDescription('Backend API for LinkedIn data collection using BrightData')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(3000);
  console.log('🚀 Application is running on: http://localhost:3000');
  console.log('📚 Swagger documentation: http://localhost:3000/api-docs');
}
bootstrap();
