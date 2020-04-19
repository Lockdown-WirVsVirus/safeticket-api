import { Body, Controller, Get, HttpCode, Logger, Param, Post, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HashingService } from '../services/hashing.service';
import { Address, Identity, Ticket, TicketsService, TicketStatus, TicketID } from '../services/tickets.service';
import { MinLength, IsNotEmpty, Length, IsDateString, ValidateIf } from 'class-validator';
import { ValidationPipe } from '../../validation/validationpipe';

export class TicketIDDto implements TicketID {
    @IsNotEmpty()
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
    reason: string;
}

@ApiTags('ticket')
@Controller('api/v1/tickets')
export class TicketsController {
    private readonly logger = new Logger(TicketsController.name);

    constructor(private readonly ticketsService: TicketsService, private readonly hashingService: HashingService) {}

    @Post()
    async createTicket(@Body(new ValidationPipe()) ticketDto: TicketRequestDto): Promise<TicketResponseDto> {
        return this.ticketsService.createTicket({
            hashedPassportId: this.hashingService.hashPassportId(ticketDto.passportId),
            reason: ticketDto.reason,
            startAddress: ticketDto.startAddress,
            endAddress: ticketDto.endAddress,
            validFromDateTime: ticketDto.validFromDateTime,
            validToDateTime: ticketDto.validToDateTime,
        });
    }

    @Get(':ticketId')
    async getTicket(@Param('ticketId', new ValidationPipe()) ticketId: TicketIDDto): Promise<TicketResponseDto> {
        return this.ticketsService.findTicket(ticketId);
    }

    @HttpCode(200)
    @Post('/for/identity')
    async retrieveTicketsForIdentity(@Body(new ValidationPipe()) identity: IdentityDto): Promise<TicketResponseDto[]> {
        return this.ticketsService.retrieveByIdentity(identity);
    }
}
