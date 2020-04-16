import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Logger, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HashingService } from '../../crypto/services/hashing.service';
import { Address, Identity, Ticket, TicketsService, TicketStatus } from '../services/tickets.service';

export class TicketRequestDto {
    passportId: string;
    reason: string;

    startAddress: AddressDto;
    endAddress: AddressDto;

    validFromDateTime: Date;
    validToDateTime: Date;
}

export class IdentityDto implements Identity {
    hashedPassportId: string;
}

export class TicketResponseDto implements Ticket {
    ticketId: string;

    hashedPassportId: string;
    reason: string;

    startAddress: AddressDto;
    endAddress: AddressDto;

    validFromDateTime: Date;
    validToDateTime: Date;

    ticketStatus: TicketStatus;
}

export class AddressDto implements Address {
    street: string;
    houseNumber: string;
    zipCode: string;
    city: string;
    country: string;
}

@ApiTags('ticket')
@Controller('api/v1/tickets')
export class TicketsController {
    private readonly logger = new Logger(TicketsController.name);

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
            throw new HttpException(`Tickets for ${identity.hashedPassportId} found`, HttpStatus.NOT_FOUND);
        }

        return ticketsOfIdentity;
    }
}
