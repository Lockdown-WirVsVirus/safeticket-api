import { Module } from '@nestjs/common';
import { TicketsController } from './controller/tickets.controller';
import { TicketsService } from './services/tickets.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ticketSchema } from './schema/tickets.schema';
import { HashingService } from './services/hashing.service';

if (!process.env.MONGODB_URI) {
  console.error('no MONGODB_URI! Please set env var.');
  process.exit(1);
}

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI),
    MongooseModule.forFeature([{ name: 'Tickets', schema: ticketSchema }]),
  ],
  controllers: [TicketsController],
  providers: [TicketsService, HashingService],
})
export class AppModule {}
