import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TicketModel } from './../schema/tickets.schema';
import { Model } from 'mongoose';
import { TicketDto, IntervalDto } from './../controller/ticket.dto';

export interface IAddress {
  street: string;
  houseNumber: string;
  zipCode: string;
  city: string;
  country: string;
}

export interface IInterval{
  hashedPin: string;
  fromDateTime: Date;
  toDateTime: Date;
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
  constructor(
    @InjectModel('Tickets') private ticketModel: Model<TicketModel>,) {}

  async createTicket(createTicketDTO: TicketDto): Promise<ITicket> {
    const createdTicket = new this.ticketModel(createTicketDTO);
    return await createdTicket.save();
  }

  async validateDateTicket(interval: IntervalDto): Promise<Boolean> {
    let endTime = new Date(interval.toDateTime);
    let startTime = new Date(interval.fromDateTime);

    if (endTime.getTime() === startTime.getTime()) {
      return false;
    }

    if (endTime < startTime) {
      return false;
    }

    const numberOfFromDateime = await this.ticketModel.find({
      hashedPassportId: interval.hashedPin,
      validFromDateTime: interval.fromDateTime
    }).count()

    if (numberOfFromDateime > 0){
      return false
    }

    const numberofTODatetime = await this.ticketModel.find({
      hashedPassportId: interval.hashedPin,
      validToDateTime: interval.toDateTime
    }).count()

    if (numberofTODatetime > 0){
      return false
    }


    return true;
  }

  getAllTickets(): ITicket[] {
    return [
      {
        id: '007',

        hashedPassportId: '',
        hashedPin: '',

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
      },
    ];
  }
}
