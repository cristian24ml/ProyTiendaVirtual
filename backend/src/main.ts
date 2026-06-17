
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  //const app = await NestFactory.create(AppModule);
  //await app.listen(process.env.PORT ?? 3000);

  //Conectar con el frontend
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(3001);
}
void bootstrap();

