import { LogLevel, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

import { HttpExceptionFilter } from './http-exception.filter';

const port = process.env.PORT || 3000;

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        // use env variable LOGGER_LEVEL: error,warn,log
        logger: (process.env.LOGGER_LEVEL?.split(',') as LogLevel[]) || ['error', 'warn', 'log'],
    });

    //register global filter to avoid exception information propagation
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalPipes(new ValidationPipe());

    // cors of course
    app.enableCors();

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
    console.log('server started at port ' + port);
}
bootstrap();
