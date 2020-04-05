import { Controller, Get } from '@nestjs/common';
import { TicketsService, ITicket } from '../services/tickets.service';

@Controller()
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  getHello(): ITicket[] {
    return this.ticketsService.getAllTickets();
  }
}
