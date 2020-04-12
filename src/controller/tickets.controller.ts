import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Response,
  HttpCode,
} from '@nestjs/common';
import { TicketsService, TicketRequest } from '../services/tickets.service';
import { ApiTags } from '@nestjs/swagger';
import { TicketRequestDto, TicketResponseDto } from './ticket.dto';

@ApiTags('ticket')
@Controller('api/v1/tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  async createTicket(
    @Body() ticketDto: TicketRequestDto,
  ): Promise<TicketResponseDto> {
    const createdTicket = await this.ticketsService.createTicket({
      hashedPassportId: '#' + ticketDto.passportId,
      reason: ticketDto.reason,
      startAddress: ticketDto.startAddress,
      endAddress: ticketDto.endAddress,
      validFromDateTime: ticketDto.validFromDateTime,
      validToDateTime: ticketDto.validToDateTime,
    });

    console.log('Created Ticket:', createdTicket);
    return createdTicket;
  }

  @Get(':ticketId')
  ticketIdRessource(@Param() ticketId: string): TicketResponseDto {
    return this.ticketsService.getTicket(ticketId);
  }
}
