import { ApiProperty } from '@nestjs/swagger';
import { Length } from 'class-validator';
import { Address, Identity, Ticket, TicketStatus } from '../services/tickets.service';

export class AddressDto implements Address {
    @ApiProperty()
    street: string;

    @ApiProperty()
    houseNumber: string;

    @ApiProperty()
    zipCode: string;

    @ApiProperty()
    city: string;

    @ApiProperty()
    country: string;
}

export class TicketRequestDto {
    @ApiProperty({
        description: 'The mandatory id of passport for verification',
    })
    passportId: string;

    @ApiProperty({ description: 'The reason why the ticket has been requested.' })
    reason: string;

    @ApiProperty({ type: AddressDto, description: 'The address where you want to start with your ticket.' })
    startAddress: AddressDto;

    @ApiProperty({ type: AddressDto, description: 'The address where you want to end with your ticket.' })
    endAddress: AddressDto;

    @ApiProperty({ description: 'The date where you want to the ticket to become active.' })
    validFromDateTime: Date;

    @ApiProperty({ description: 'The date where you want to activate the ticket.' })
    validToDateTime: Date;
}

export class IdentityDto implements Identity {
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
    reason: string;

    @ApiProperty({ type: AddressDto })
    startAddress: AddressDto;
    @ApiProperty({ type: AddressDto })
    endAddress: AddressDto;

    @ApiProperty()
    validFromDateTime: Date;
    @ApiProperty()
    validToDateTime: Date;

    @ApiProperty({ readOnly: true })
    ticketStatus: TicketStatus;
}
