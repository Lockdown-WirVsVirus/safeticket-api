import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Response,
  HttpCode,
  Logger,
} from '@nestjs/common';
import { TicketsService, TicketRequest } from '../services/tickets.service';
import { ApiTags } from '@nestjs/swagger';
import { TicketRequestDto, TicketResponseDto } from './ticket.dto';

@ApiTags('ticket')
@Controller('api/v1/tickets')
export class TicketsController {
  private readonly logger = new Logger(TicketsController.name);

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

    // this.logger.log('Created Ticket:', JSON.stringify(createdTicket));
    return createdTicket;
  }

  @Get(':ticketId')
  ticketIdRessource(@Param('ticketId') ticketId: string): TicketResponseDto {
    return this.ticketsService.getTicket(ticketId);
  }

  @Post("deleteTickets")
  async deleteTicket(@Body() ticketDto: TicketDto): Promise<String>{
    console.log
    return this.ticketsService.deleteTicket(ticketDto);
  }
}
