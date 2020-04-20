import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Logger, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MinLength, IsNotEmpty, Length, IsDateString } from 'class-validator';
import { HashingService } from '../../crypto/services/hashing.service';
import { Address, Identity, Ticket, TicketsService, TicketStatus, TicketID } from '../services/tickets.service';

export class TicketIDDto implements TicketID {
    searchTicketId: string;
}

export class IdentityDto implements Identity {
    @IsNotEmpty()
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
    @IsNotEmpty()
    street: string;
    @IsNotEmpty()
    houseNumber: string;
    @IsNotEmpty()
    @Length(5)
    zipCode: string;
    @IsNotEmpty()
    city: string;
    @MinLength(2)
    country: string;
}

export class TicketRequestDto {
    @IsNotEmpty()
    passportId: string;
    @IsNotEmpty()
    startAddress: AddressDto;
    @IsNotEmpty()
    endAddress: AddressDto;
    @IsDateString()
    validFromDateTime: Date;
    @IsDateString()
    validToDateTime: Date;
    @IsNotEmpty()
    reason: string;
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
            // return array if not found by ticket service
            return [];
        }

        return ticketsOfIdentity;
    }
}
