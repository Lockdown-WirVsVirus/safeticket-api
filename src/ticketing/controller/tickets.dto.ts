import { ApiProperty } from '@nestjs/swagger';
import { Length, IsNotEmpty, MinLength, IsDateString, IsDate, MinDate } from 'class-validator';
import { Address, Identity, Ticket, TicketStatus } from '../services/tickets.service';
import { Type } from 'class-transformer';
import { async } from 'rxjs/internal/scheduler/async';

export class AddressDto implements Address {
    @ApiProperty()
    @IsNotEmpty()
    street: string;

    @ApiProperty()
    @IsNotEmpty()
    houseNumber: string;

    @ApiProperty()
    @Length(5)
    @IsNotEmpty()
    zipCode: string;

    @ApiProperty()
    @IsNotEmpty()
    city: string;

    @ApiProperty()
    @MinLength(2)
    country: string;
}

export class TicketRequestDto {
    @ApiProperty({
        description: 'The mandatory id of passport for verification',
    })
    @IsNotEmpty()
    passportId: string;

    @ApiProperty({ description: 'The reason why the ticket has been requested.' })
    reason: string;

    @ApiProperty({ type: AddressDto, description: 'The address where you want to start with your ticket.' })
    @IsNotEmpty()
    startAddress: AddressDto;

    @ApiProperty({ type: AddressDto, description: 'The address where you want to end with your ticket.' })
    @IsNotEmpty()
    endAddress: AddressDto;

    @ApiProperty({ description: 'The date where you want to the ticket to become active.' })
    @Type(() => Date)
    @IsDate()
    @MinDate(new Date())
    validFromDateTime: Date;

    @ApiProperty({ description: 'The date where you want to activate the ticket.' })
    @Type(() => Date)
    @IsDate()
    @MinDate(new Date())
    validToDateTime: Date;
}

export class IdentityDto implements Identity {
    @IsNotEmpty()
    @Length(64, 64)
    @ApiProperty({
        readOnly: true,
        minLength: 64,
        maxLength: 64,
        example: 'c293d36062172953e4319371112e407f78e04c7aa2bc46bcdb2a3d683f6f4f04',
        description: 'The hashed passport id which has been generated during creation of ticket',
    })
    hashedPassportId: string;
}

export class TicketResponseDto implements Ticket {
    @ApiProperty({ readOnly: true })
    ticketId: string;

    @Length(64, 64)
    @ApiProperty({
        readOnly: true,
        minLength: 64,
        maxLength: 64,
        example: 'c293d36062172953e4319371112e407f78e04c7aa2bc46bcdb2a3d683f6f4f04',
        description: 'The hashed passport id which has been generated during creation of ticket',
    })
    hashedPassportId: string;

    @ApiProperty()
    @IsNotEmpty()
    reason: string;

    @ApiProperty({ type: AddressDto })
    @IsNotEmpty()
    startAddress: AddressDto;

    @ApiProperty({ type: AddressDto })
    @IsNotEmpty()
    endAddress: AddressDto;

    @ApiProperty()
    @IsDateString()
    validFromDateTime: Date;

    @ApiProperty()
    @IsDateString()
    validToDateTime: Date;

    @ApiProperty({ readOnly: true })
    @IsNotEmpty()
    ticketStatus: TicketStatus;
}
