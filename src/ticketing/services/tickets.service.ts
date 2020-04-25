import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { Model } from 'mongoose';
import { TicketModel } from './tickets.schema';
import PDFDocument = require('pdfkit');
import getStream = require('get-stream');

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

    async generateTicketPDF(): Promise<String> {
        const pdf = async () => {
            const doc = new PDFDocument();
            // Add another page
            doc.addPage()
                .fontSize(25)
                .text('Here is some vector graphics...', 100, 100);

            // Draw a triangle
            doc.save()
                .moveTo(100, 150)
                .lineTo(100, 250)
                .lineTo(200, 250)
                .fill('#FF3300');

            // Apply some transforms and render an SVG path with the 'even-odd' fill rule
            doc.scale(0.6)
                .translate(470, -380)
                .path('M 250,75 L 323,301 131,161 369,161 177,301 z')
                .fill('red', 'even-odd')
                .restore();

            // Add some text with annotations
            doc.addPage()
                .fillColor('blue')
                .text('Here is a link!', 100, 100)
                .underline(100, 100, 160, 27, { color: '#0000FF' })
                .link(100, 100, 160, 27, 'http://google.com/');
            doc.end();
            return await getStream.buffer(doc);
        };

        const pdfBuffer = await pdf();
        return pdfBuffer.toString('base64');
    }
}
