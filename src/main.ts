import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './http-exception.filter';

const port = process.env.PORT || 3000;

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn', 'log', 'debug'],
    });

    //register global filter to avoid exception filter
    app.useGlobalFilters(new HttpExceptionFilter());

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
