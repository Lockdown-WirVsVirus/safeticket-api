import { ITicket, IAddress } from "src/services/tickets.service";

export class TicketDto implements ITicket {
    id: string;

    // owner
    hashedPassportId: string;
    hashedPin: string;

    reason: string;

    startAddress: IAddress;
    endAddress: IAddress;

    validFromDateTime: Date;
    validToDateTime: Date;
}