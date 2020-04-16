import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Param, Logger, HttpCode, HttpException, HttpStatus } from '@nestjs/common';
import { TicketsService, Identity, Ticket, Address, TicketStatus } from '../services/tickets.service';
import { HashingService } from '../services/hashing.service';

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
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        }

        return foundTicket;
    }

    @HttpCode(200)
    @Post('/for/identity')
    async retrieveTicketsForIdentity(@Body() identity: IdentityDto): Promise<TicketResponseDto[]> {
        const ticketsOfIdentity: TicketResponseDto[] = await this.ticketsService.retrieveByIdentity(identity);

        return ticketsOfIdentity;
    }
}
