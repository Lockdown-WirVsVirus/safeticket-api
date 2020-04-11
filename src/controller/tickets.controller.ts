import { Controller, Get, Post, Body } from '@nestjs/common';
import { TicketsService } from '../services/tickets.service';
import { ApiTags } from '@nestjs/swagger';
import { TicketDto, IntervalDto } from './ticket.dto';

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

  @Post("validateDate")
  async  validateTicket(@Body() IntervalDto: IntervalDto): Promise<Boolean>{
    return await this.ticketsService.validateDateTicket(IntervalDto);
  }

  @Get(":id")
  ticketIdRessource(): TicketDto[] {
    return this.ticketsService.getAllTickets();
  }
}
