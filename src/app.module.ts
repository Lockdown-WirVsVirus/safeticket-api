import { Module } from '@nestjs/common';
import { TicketsController } from './controller/tickets.controller';
import { TicketsService } from './services/tickets.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ticketSchema } from './schema/tickets.schema';
import { HashingService } from './services/hashing.service';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://root:example@localhost:27017/admin'),
    MongooseModule.forFeature([{ name: 'Tickets', schema: ticketSchema }]),
  ],
  controllers: [TicketsController],
  providers: [TicketsService, HashingService],
})
export class AppModule {}
