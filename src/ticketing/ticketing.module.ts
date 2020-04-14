import { Module } from '@nestjs/common';
import { TicketsController } from './controller/tickets.controller';
import { TicketsService } from './services/tickets.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ticketSchema } from './services/tickets.schema';
import { HashingService } from './services/hashing.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Tickets', schema: ticketSchema }]),
  ],
  controllers: [TicketsController],
  providers: [TicketsService, HashingService],
  exports: [TicketsService, HashingService],
})
export class TicketingModule {}
