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
import {
  TicketRequestDto,
  TicketResponseDto,
  TicketsOfUser,
  IdentityDto,
} from './ticket.dto';
import { identity } from 'rxjs';

@ApiTags('ticket')
@Controller('api/v1/tickets')
export class TicketsController {
  private readonly logger = new Logger(TicketsController.name);

  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  async createTicket(
    @Body() ticketDto: TicketRequestDto,
  ): Promise<TicketResponseDto> {
    return this.ticketsService.createTicket({
      hashedPassportId: '#' + ticketDto.passportId,
      reason: ticketDto.reason,
      startAddress: ticketDto.startAddress,
      endAddress: ticketDto.endAddress,
      validFromDateTime: ticketDto.validFromDateTime,
      validToDateTime: ticketDto.validToDateTime,
    });
  }

  @Get(':ticketId')
  async getTicket(
    @Param('ticketId') ticketId: string,
  ): Promise<TicketResponseDto> {
    return this.ticketsService.findTicket(ticketId);
  }

  @Post('/identity')
  async retrieveTicketsForIdentity(
    @Body() identity: IdentityDto,
  ): Promise<TicketResponseDto[]> {
    return this.ticketsService.retrieveByIdentity(identity);
  }
}
