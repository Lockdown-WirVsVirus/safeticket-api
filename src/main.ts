import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

const port = process.env.PORT || 3000
console.log( process.env.MLAB_HOST || "localhost" + '/' + process.env.MLAB_DATABASE)
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // open api spec (Swagger)
  const options = new DocumentBuilder()
    .setTitle('SafeTicket tickets api')
    .setDescription('the tickets api of project SafeTicket')
    .setVersion('1.0')
    .addTag('ticket')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-doc', app, document);

  await app.listen(port);
  console.log("server started at port " + port);
}
bootstrap();
