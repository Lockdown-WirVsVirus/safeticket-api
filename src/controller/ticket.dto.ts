import { ITicket, IAddress, IInterval } from "src/services/tickets.service";

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

export class IntervalDto implements IInterval {
    readonly hashedPin: string;
    readonly fromDateTime: Date;
    readonly toDateTime: Date;
} 