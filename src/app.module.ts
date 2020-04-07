import { Module } from '@nestjs/common';
import { TicketsController } from './controller/tickets.controller';
import { TicketsService } from './services/tickets.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TicketSchema } from './schema/tickets.schema';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb://' + process.env.MLAB_HOST + '/' + process.env.MLAB_DATABASE,
    ),
    MongooseModule.forFeature([{ name: 'Tickets', schema: TicketSchema }]),
  ],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class AppModule {}
