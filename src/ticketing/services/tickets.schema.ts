import * as mongoose from 'mongoose';
import { Ticket } from './tickets.service';
import { CounterSchema, COUNTER_MODEL_NAME } from './counter.schema';
import { randomSpeakableCharGenerator } from './randomSpeakable';

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

// Counter Pre-save hook
const counterModel = mongoose.model(COUNTER_MODEL_NAME, CounterSchema);

// ticketSchema.pre('save', function(next) {
//     var doc = this;
//     counterModel.findByIdAndUpdate({_id: 'entityId'}, {$inc: { seq: 1} }, function(error, counter)   {
//         if(error) {
//             return next(error);
//         }

//         // create random number verification code prefixed by two speakable chars
//         const speakable = randomSpeakableCharGenerator() + randomSpeakableCharGenerator();
//         doc['verificationCode'] = speakable + counter['seq'];
//         next();
//     });
// });
