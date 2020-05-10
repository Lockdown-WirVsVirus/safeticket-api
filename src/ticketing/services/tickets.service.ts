import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { TicketModel } from './tickets.schema';
import PDFDocument = require('pdfkit');
import getStream = require('get-stream');
import { base64StringToBlob } from 'blob-util'

export interface TicketID {
    searchTicketId: string;
}

export interface PDFID {
    firstname: string;
    lastname: string;
    ticketID: string;
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

    async generateTicketPDF(pdfrequest: PDFID): Promise<String> {
        let ticket = await this.ticketModel.findOne({
            _id: new ObjectId(pdfrequest.ticketID),
        });
        
            const doc = new PDFDocument();
            doc.text('Ticket#', 100, 100);
            doc.text(ticket.ticketId, 150, 100);

            doc.text('Begründung', 100, 200);
            doc.text(ticket.reason, 200, 200);

            doc.text('Gültig von', 100, 250);
            doc.text(ticket.validFromDateTime.toISOString(), 200, 450);

            doc.text('Gültig bis', 100, 300);
            doc.text(ticket.validToDateTime.toISOString(), 200, 500);

            doc.text('Gültig für', 100, 350);
            doc.text(pdfrequest.firstname +" " +  pdfrequest.lastname, 200, 550);

            doc.text('Start-Addresse', 100, 400);
            doc.text(ticket.startAddress.street +" " + ticket.startAddress.houseNumber + " " +  ticket.startAddress.zipCode, 200, 600);

            doc.text('Start-Addresse', 100, 450);
            doc.text(ticket.endAddress.street + " " +  ticket.endAddress.houseNumber+ " " +  ticket.endAddress.zipCode, 200, 650);
            doc.end();
         return (await getStream.buffer(doc)).toString("base64");
    

    }
}
