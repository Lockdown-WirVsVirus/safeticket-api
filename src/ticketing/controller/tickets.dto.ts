import { ApiProperty } from '@nestjs/swagger';
import { Length, IsNotEmpty, MinLength, IsDateString, isNotEmpty, IsDataURI, isDateString } from 'class-validator';
import { Address, Identity, Ticket, TicketStatus } from '../services/tickets.service';

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
    @IsDateString()
    validFromDateTime: Date;

    @ApiProperty({ description: 'The date where you want to activate the ticket.' })
    @IsDateString()
    validToDateTime: Date;
}

export class IdentityDto implements Identity {
    @IsNotEmpty()
    @Length(24, 24)
    @ApiProperty({ description: 'The hashed passport id which has been generated during creation of ticket' })
    hashedPassportId: string;
}

export class TicketResponseDto implements Ticket {
    @ApiProperty({ readOnly: true })
    ticketId: string;

    @Length(24, 24)
    @ApiProperty({ readOnly: true })
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
