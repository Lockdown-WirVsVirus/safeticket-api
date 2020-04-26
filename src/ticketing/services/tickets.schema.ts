import * as mongoose from 'mongoose';
import { Ticket } from './tickets.service';

export const TICKET_MODEL_NAME = 'Tickets';

export interface TicketModel extends Ticket, mongoose.Document {
    verificationCode: string;
}

export const ticketSchema = new mongoose.Schema(
    {
        hashedPassportId: String,

        reason: String,

        verificationCode: { type: String, unique: true },

        startAddress: {
            street: String,
            houseNumber: String,
            zipCode: String,
            city: String,
            country: String,
        },
        endAddress: {
            street: String,
            houseNumber: String,
            zipCode: String,
            city: String,
            country: String,
        },

        validFromDateTime: Date,
        validToDateTime: Date,
    },
    {
        toObject: {
            virtuals: true,
        },
        toJSON: {
            virtuals: true,
        },
    },
);

// add virtual ticketId;
ticketSchema.virtual('ticketId').get(function() {
    return this._id;
});

// create index for verificationCode
ticketSchema.index({ verificationCode: 1 });
