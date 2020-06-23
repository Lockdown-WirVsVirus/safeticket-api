import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { err, ok, Result } from 'neverthrow';
import { TicketModel, TICKET_MODEL_NAME } from './tickets.schema';
import PDFDocument = require('pdfkit');
import getStream = require('get-stream');
import { ShortidService } from './shortid.service';
import { Cron } from '@nestjs/schedule';

/**
 * Enumeration of reason why ticket creation failed.
 */
export enum TicketCreationFailureReason {
    /**
     * There exists a same ticket for the same time.
     */
    ConflictInTime,
    /**
     * Undefined technical error.
     */
    InternalError,
}
/**
 * Custom failure holder  for reason why ticket creation has been aborted or declined.
 */
export class TicketCreationFailure {
    constructor(public readonly reason: TicketCreationFailureReason, public readonly error?: Error) {}
}

export interface TicketID {
    searchTicketId: string;
}

export interface PDFID {
    firstname: string;
    lastname: string;
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
    status: TicketStatus;
}

export interface Ticket extends TicketRequest {
    ticketId: string;
    ticketStatus: TicketStatus;
    verificationCode: string;
}
/**
 * Service for handling all tickets agnostic to any external access point e.g.: controller, scheduler etc.
 */
@Injectable()
export class TicketsService {
    constructor(@InjectModel(TICKET_MODEL_NAME) private ticketModel: Model<TicketModel>, private readonly shortidService: ShortidService) {}

    /**
     *Creates a new ticket by given request.
     * @param ticketToCreate the new ticket to create.
     */
    async createTicket(ticketToCreate: TicketRequest): Promise<Result<Ticket, TicketCreationFailure>> {
        try {
            let numberOfTicketsInDB = await this.ticketModel
                .find({
                    $or: [
                        {
                            // exists one with valid from smaller and to greater than new validFrom
                            validFromDateTime: {
                                $lte: ticketToCreate.validFromDateTime,
                            },
                            validToDateTime: {
                                $gte: ticketToCreate.validFromDateTime,
                            },
                        },
                        {
                            // exists one with valid from smaller and to greater than new validFrom
                            validFromDateTime: {
                                $lte: ticketToCreate.validToDateTime,
                            },
                            validToDateTime: {
                                $gte: ticketToCreate.validToDateTime,
                            },
                        },
                    ],
                    hashedPassportId: ticketToCreate.hashedPassportId,
                })
                .countDocuments();

            if (numberOfTicketsInDB > 0) {
                return Promise.resolve(err(new TicketCreationFailure(TicketCreationFailureReason.ConflictInTime)));
            }

            // enhance ticket object by verificationCode
            const enhancedTicket = {
                verificationCode: this.shortidService.generateShortId(),
                ...ticketToCreate,
            };

            const savedTicket: Ticket = await new this.ticketModel(enhancedTicket).save();
            return Promise.resolve(ok(savedTicket));
        } catch (e) {
            //catch every thing and return them
            return Promise.reject(err(new TicketCreationFailure(TicketCreationFailureReason.InternalError, e)));
        }
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

    async generateTicketPDF(ticketID: string, pdfrequest: PDFID): Promise<Buffer> {
        let ticket = await this.ticketModel.findOne({
            _id: new ObjectId(ticketID),
        });

        const doc = new PDFDocument();
        doc.text('Ticket#', 100, 100);
        doc.text(ticket.ticketId, 150, 100);

        doc.text('Begründung', 100, 200);
        doc.text(ticket.reason, 200, 200);

        doc.text('Gültig von', 100, 250);
        doc.text(ticket.validFromDateTime.toISOString(), 200, 250);

        doc.text('Gültig bis', 100, 300);
        doc.text(ticket.validToDateTime.toISOString(), 200, 500);

        if (pdfrequest.firstname && pdfrequest.lastname) {
            doc.text('Gültig für', 100, 350);
            doc.text(pdfrequest.firstname + ' ' + pdfrequest.lastname, 200, 350);
        }

        doc.text('Start-Addresse', 100, 400);
        doc.text(ticket.startAddress.street + ' ' + ticket.startAddress.houseNumber + ' ' + ticket.startAddress.zipCode, 200, 400);

        doc.text('Start-Addresse', 100, 450);
        doc.text(ticket.endAddress.street + ' ' + ticket.endAddress.houseNumber + ' ' + ticket.endAddress.zipCode, 200, 450);
        doc.end();

        return await getStream.buffer(doc);
    }

    // at 00:00 every day
    @Cron('0 0 0 * * *')
    // set all tickets where validToDateTime is in past to status Expired
    async invalidTickets(): Promise<void> {
        await this.ticketModel.update(
            {
                validToDateTime: {
                    $lte: new Date(),
                },
                status: 'CREATED',
            },
            { status: 'EXPIRED' },
        );
    }

    async invalidTicketByID(ticketId: string): Promise<Boolean> {
        let doc = await this.ticketModel.update(
            {
                _id: new ObjectId(ticketId),
            },
            { status: 'EXPIRED' },
            { new: true },
        );
        return doc.status === 'EXPIRED';
    }
}
