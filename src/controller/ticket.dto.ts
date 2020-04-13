import {
  IAddress,
  TicketStatus,
  Ticket,
  Identity,
} from 'src/services/tickets.service';

export class TicketRequestDto {
  passportId: string;
  reason: string;

  startAddress: IAddress;
  endAddress: IAddress;

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

  startAddress: IAddress;
  endAddress: IAddress;

  validFromDateTime: Date;
  validToDateTime: Date;

  ticketStatus: TicketStatus;
}
