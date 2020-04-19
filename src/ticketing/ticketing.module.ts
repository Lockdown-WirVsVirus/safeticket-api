import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TicketsController } from './controller/tickets.controller';
import { ticketSchema, TICKET_MODEL_NAME } from './services/tickets.schema';
import { TicketsService } from './services/tickets.service';
import { CryptoModule } from '../crypto/crypto.module';

@Module({
    imports: [MongooseModule.forFeature([{ name: TICKET_MODEL_NAME, schema: ticketSchema }]), CryptoModule],
    controllers: [TicketsController],
    providers: [TicketsService],
    exports: [TicketsService],
})
export class TicketingModule {}
