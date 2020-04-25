import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { TicketModel } from './tickets.schema';

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

export interface ITicketID {
    ticketID: string;
}

export interface TicketRequest extends Identity {
    reason: string;

    startAddress: Address;
    endAddress: Address;

    validFromDateTime: Date;
    validToDateTime: Date;
    status: TicketStatus;
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
        let numberOfTicketsValidTo = await this.ticketModel
            .find({
                validToDateTime: {
                    $gte: ticketToCreate.validFromDateTime,
                    $lte: ticketToCreate.validToDateTime,
                },
                hashedPassportId: ticketToCreate.hashedPassportId,
            })
            .count();

        let numberOfTicketsValidEnd = await this.ticketModel
            .find({
                validFromDateTime: {
                    $gte: ticketToCreate.validFromDateTime,
                    $lte: ticketToCreate.validToDateTime,
                },
                hashedPassportId: ticketToCreate.hashedPassportId,
            })
            .count();
        if (numberOfTicketsValidEnd > 0 || numberOfTicketsValidTo > 0) {
            throw new HttpException('Ticket exist', HttpStatus.CONFLICT);
        }
        return new this.ticketModel(ticketToCreate).save();
    }

    /**
     * Search all tickets which belongs to hashed password id.
     * @param searchedHashedPasswordId hashed passwort id to search for tickets
     */
    async retrieveByIdentity(identity: Identity): Promise<Ticket[]> {
        return this.ticketModel.find({
            hashedPassportId: identity.hashedPassportId,
        });
    }
    /**
     *Find one ticket by ticket id.
     * @param searchTicketId the ticket id of the ticket to search
     */
    async findTicket(searchTicketId: string): Promise<Ticket> {
        const foundTicket: Ticket = await this.ticketModel.findOne({
            _id: new ObjectId(searchTicketId),
        });

        return foundTicket;
    }

    async invalidTickets(): Promise<void> {
        let dayBeginning = new Date();
        dayBeginning.setHours(0, 0, 0, 0);

        this.ticketModel.updateMany(
            {
                validToDateTime: {
                    $lte: new Date(),
                    $gte: dayBeginning,
                },
                ticketStatus: 'CREATED',
            },
            { ticketStatus: 'EXPIRED' },
        );
    }
}
