import { Controller, Get, Post, Body } from '@nestjs/common';
import { TicketsService, ITicket } from '../services/tickets.service';
import { ApiTags } from '@nestjs/swagger';
import { TicketDto } from './ticket.dto';

@ApiTags('ticket')
@Controller("api/v1/tickets")
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  ticketsRessource(): TicketDto[] {
    return this.ticketsService.getAllTickets();
  }

  @Post()
  createTicket(@Body() ticketDto: TicketDto): String{
    this.ticketsService.createTicket(ticketDto)
    return "Created"
  }

  @Get(":id")
  ticketIdRessource(): TicketDto[] {
    return this.ticketsService.getAllTickets();
  }
}
