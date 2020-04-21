import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HashingService } from '../../crypto/services/hashing.service';
import { TicketsService } from '../services/tickets.service';
import { IdentityDto, TicketRequestDto, TicketResponseDto } from './tickets.dto';

@ApiTags('ticket')
@Controller('api/v1/tickets')
export class TicketsController {
    constructor(private readonly ticketsService: TicketsService, private readonly hashingService: HashingService) {}

    @Post()
    async createTicket(@Body() ticketDto: TicketRequestDto): Promise<TicketResponseDto> {
        return this.ticketsService.createTicket({
            hashedPassportId: await this.hashingService.hashPassportId(ticketDto.passportId),
            reason: ticketDto.reason,
            startAddress: ticketDto.startAddress,
            endAddress: ticketDto.endAddress,
            validFromDateTime: ticketDto.validFromDateTime,
            validToDateTime: ticketDto.validToDateTime,
        });
    }

    @Get(':ticketId')
    async getTicket(@Param('ticketId') ticketId: string): Promise<TicketResponseDto> {
        const foundTicket: TicketResponseDto = await this.ticketsService.findTicket(ticketId);

        if (!foundTicket) {
            throw new HttpException('Ticket not Found', HttpStatus.NOT_FOUND);
        }

        return foundTicket;
    }

    @HttpCode(200)
    @Post('/for/identity')
    async retrieveTicketsForIdentity(@Body() identity: IdentityDto): Promise<TicketResponseDto[]> {
        const ticketsOfIdentity: TicketResponseDto[] = await this.ticketsService.retrieveByIdentity(identity);

        if (!ticketsOfIdentity) {
            // return array if not found by ticket service
            return [];
        }

        return ticketsOfIdentity;
    }
}
