import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TicketsController } from './controller/tickets.controller';
import { ticketSchema } from './services/tickets.schema';
import { TicketsService } from './services/tickets.service';

@Module({
    imports: [MongooseModule.forFeature([{ name: 'Tickets', schema: ticketSchema }])],
    controllers: [TicketsController],
    providers: [TicketsService],
    exports: [TicketsService],
})
export class TicketingModule {}
