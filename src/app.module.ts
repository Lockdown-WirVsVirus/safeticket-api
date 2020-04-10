import { Module } from '@nestjs/common';
import { TicketsController } from './controller/tickets.controller';
import { TicketsService } from './services/tickets.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TicketSchema } from './schema/tickets.schema';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb://localhost:27017/tickets',
    ),
    MongooseModule.forFeature([{ name: 'Tickets', schema: TicketSchema }]),
  ],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class AppModule {}
