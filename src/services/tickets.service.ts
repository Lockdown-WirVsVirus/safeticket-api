import { Injectable } from '@nestjs/common';

export interface IAddress {
  street: string;
  houseNumber: string;
  zipCode: string;
  city: string;
  country: string;
}

export interface ITicket {
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

@Injectable()
export class TicketsService {
  getAllTickets(): ITicket[] {
    return [
      {
        id: "007",

        hashedPassportId: "",
        hashedPin: "",

        reason: "Partyabend",

        startAddress: {
          street: "",
          houseNumber: "",
          zipCode: "",
          city: "",
          country: ""
        },
        endAddress: {
          street: "",
          houseNumber: "",
          zipCode: "",
          city: "",
          country: ""
        },

        validFromDateTime: new Date(),
        validToDateTime: new Date(),
      },
    ]
  }
}
