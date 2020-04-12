import * as mongoose from 'mongoose';
import { Ticket } from 'src/services/tickets.service';

export interface TicketModel extends Ticket, mongoose.Document {}
export const ticketSchema = new mongoose.Schema({
  ticketId: String,
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
});
export const ticketModel = mongoose.model<TicketModel>('Tickets', ticketSchema);
