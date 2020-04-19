import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { TicketModel } from './tickets.schema';
import { TicketIDDto } from '../controller/tickets.controller';
import { validate, validateOrReject } from 'class-validator';

export interface TicketID {
    searchTicketId: string;
}

export interface Address {
    street: string;
    houseNumber: string;
    zipCode: string;
    city: string;
    country: string;
}
export type TicketStatus = 'CREATED' | 'EXPIRED' | 'DECLINED';

export interface Identity {
    hashedPassportId: string;
}

export interface TicketRequest extends Identity {
    reason: string;

    startAddress: Address;
    endAddress: Address;

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

    constructor(@InjectModel('Tickets') private ticketModel: Model<TicketModel>) {}

    /**
     *Creates a new ticket by given request.
     * @param ticketToCreate the new ticket to create.
     */
    async createTicket(ticketToCreate: TicketRequest): Promise<Ticket> {
        validateOrReject(ticketToCreate).catch(errors => {
            throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
        });
        return new this.ticketModel(ticketToCreate).save();
    }

    /**
     * Search all tickets which belongs to hashed password id.
     * @param searchedHashedPasswordId hashed passwort id to search for tickets
     */
    async retrieveByIdentity(identity: Identity): Promise<Ticket[]> {
        validateOrReject(identity).catch(errors => {
            throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
        });
        return this.ticketModel.find({
            hashedPassportId: identity.hashedPassportId,
        });
    }
    /**
     *Find one ticket by ticket id.
     * @param searchTicketId the ticket id of ticket to search
     */
    async findTicket(searchTicketId: TicketIDDto): Promise<Ticket> {
        validateOrReject(searchTicketId).catch(errors => {
            throw new HttpException('BAD_REQUEST', HttpStatus.BAD_REQUEST);
        });
        const foundTicket: Ticket = await this.ticketModel.findOne({
            _id: new ObjectId(searchTicketId.searchTicketId),
        });

        return foundTicket;
    }
}
