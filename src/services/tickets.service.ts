import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TicketResponseDto } from './../controller/ticket.dto';
import { TicketModel } from '../schema/tickets.schema';

interface IAddress {
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
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    @InjectModel('Tickets') private ticketModel: Model<TicketModel>,
  ) {}

  async createTicket(ticketToCreate: TicketRequest): Promise<Ticket> {
    // this.logger.log('Save Ticket:', JSON.stringify(ticketToCreate));

    const createdTicket = new this.ticketModel(ticketToCreate);
    return createdTicket.save();
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
