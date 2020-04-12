import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TicketResponseDto } from './../controller/ticket.dto';
import { TicketModel } from '../schema/tickets.schema';

export interface IAddress {
  street: string;
  houseNumber: string;
  zipCode: string;
  city: string;
  country: string;
}
export type TicketStatus = 'CREATED' | 'EXPIRED' | 'DECLINED';

export interface TicketRequest {
  hashedPassportId: string;
  reason: string;

  startAddress: IAddress;
  endAddress: IAddress;

  validFromDateTime: Date;
  validToDateTime: Date;
}

export interface Ticket extends TicketRequest {
  ticketId: string;
  ticketStatus: TicketStatus;
}

@Injectable()
export class TicketsService {
  constructor(
    @InjectModel('Tickets') private ticketModel: Model<TicketModel>,
  ) {}

  async createTicket(ticketToCreate: TicketRequest): Promise<Ticket> {
    console.log('Save ticket:', ticketToCreate);
    const createdTicket = new this.ticketModel(ticketToCreate);
    return createdTicket.save();
  }

  getTicket(ticketId: String): TicketResponseDto {
    return {
      ticketId: '007',

      hashedPassportId: '',

      reason: 'Partyabend',

      startAddress: {
        street: '',
        houseNumber: '',
        zipCode: '',
        city: '',
        country: '',
      },
      endAddress: {
        street: '',
        houseNumber: '',
        zipCode: '',
        city: '',
        country: '',
      },

      validFromDateTime: new Date(),
      validToDateTime: new Date(),

      ticketStatus: 'CREATED',
    };
  }
}
