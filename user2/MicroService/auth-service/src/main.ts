import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as mongoose from 'mongoose';

async function bootstrap() {
  await mongoose.connect('mongodb://localhost:27017/auth_db');

  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
