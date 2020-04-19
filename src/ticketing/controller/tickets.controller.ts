import { Body, Controller, Get, HttpCode, Logger, Param, Post, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HashingService } from '../services/hashing.service';
import { Address, Identity, Ticket, TicketsService, TicketStatus, TicketID } from '../services/tickets.service';
import { MinLength, IsNotEmpty, IsDate, Length } from 'class-validator';
import { validate } from 'class-validator';

export class TicketIDDto implements TicketID {
    @IsNotEmpty()
    searchTicketId: string;
}

export class IdentityDto implements Identity {
    @Length(1000)
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
    reason: string;
    @IsNotEmpty()
    startAddress: AddressDto;
    @IsNotEmpty()
    endAddress: AddressDto;
    @IsDate()
    validFromDateTime: Date;
    @IsDate()
    validToDateTime: Date;
}

@ApiTags('ticket')
@Controller('api/v1/tickets')
export class TicketsController {
    private readonly logger = new Logger(TicketsController.name);

    constructor(private readonly ticketsService: TicketsService, private readonly hashingService: HashingService) {}

    @Post()
    async createTicket(@Body() ticketDto: TicketRequestDto): Promise<TicketResponseDto> {
        validate(ticketDto).then(errors => {
            if (errors.length > 0) {
                throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
            }
        });
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
    async getTicket(@Param('ticketId') ticketId: TicketIDDto): Promise<TicketResponseDto> {
        validate(ticketId).then(errors => {
            if (errors.length > 0) {
                throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
            }
        });
        return this.ticketsService.findTicket(ticketId);
    }

    @HttpCode(200)
    @Post('/for/identity')
    async retrieveTicketsForIdentity(@Body() identity: IdentityDto): Promise<TicketResponseDto[]> {
        return this.ticketsService.retrieveByIdentity(identity);
    }
}
