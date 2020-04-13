import { TicketStatus, Ticket } from 'src/services/tickets.service';

class Address {
  street: string;
  houseNumber: string;
  zipCode: string;
  city: string;
  country: string;
}

export class TicketRequestDto {
  passportId: string;
  reason: string;

  startAddress: Address;
  endAddress: Address;

  validFromDateTime: Date;
  validToDateTime: Date;
}

export class TicketResponseDto implements Ticket {
  ticketId: string;

  hashedPassportId: string;
  reason: string;

  startAddress: Address;
  endAddress: Address;

  validFromDateTime: Date;
  validToDateTime: Date;

  ticketStatus: TicketStatus;
}
