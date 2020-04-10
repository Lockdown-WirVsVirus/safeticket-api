import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TicketModel } from "./../schema/tickets.schema";
import { Model, Types } from "mongoose";
import { TicketDto } from "./../controller/ticket.dto";


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
  constructor(@InjectModel('Tickets') private ticketModel: Model<TicketModel>) { }

  async createTicket(createTicketDTO: TicketDto): Promise<ITicket> {
    const createdTicket = new this.ticketModel(createTicketDTO);
    return await createdTicket.save();
  }

  async deleteTicket(deleteTicketDTO: TicketDto): Promise<String> {
    if (!deleteTicketDTO.id) {
      return "id is empty";
    }

    let result = await this.ticketModel.deleteOne({
      id: deleteTicketDTO.id
    })

    if (result.n == 0) {
      return "No tickets with this id";
    }
    return "Delete ticket";
  }

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
