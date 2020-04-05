import { Module } from '@nestjs/common';
import { TicketsController } from './controller/tickets.controller';
import { TicketsService } from './services/tickets.service';

@Module({
  imports: [],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class AppModule {}
