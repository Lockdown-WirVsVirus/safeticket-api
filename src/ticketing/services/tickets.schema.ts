import * as mongoose from 'mongoose';
import { Ticket } from './tickets.service';

export interface TicketModel extends Ticket, mongoose.Document {}
export const ticketSchema = new mongoose.Schema({
  
  hashedPassportId: String,

  reason: String,

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
},{
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
});

// add virtual ticketId;
ticketSchema.virtual('ticketId').get(function() {
  return this._id;
})

export const ticketModel = mongoose.model<TicketModel>('Tickets', ticketSchema);
