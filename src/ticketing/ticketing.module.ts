import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TicketsController } from './controller/tickets.controller';
import { ticketSchema, TICKET_MODEL_NAME } from './services/tickets.schema';
import { TicketsService } from './services/tickets.service';
import { CryptoModule } from '../crypto/crypto.module';
import { CounterSchema, COUNTER_MODEL_NAME } from './services/counter.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: TICKET_MODEL_NAME, schema: ticketSchema },
            { name: COUNTER_MODEL_NAME, schema: CounterSchema },
        ]),
        CryptoModule,
    ],
    controllers: [TicketsController],
    providers: [TicketsService],
    exports: [TicketsService],
})
export class TicketingModule {}
