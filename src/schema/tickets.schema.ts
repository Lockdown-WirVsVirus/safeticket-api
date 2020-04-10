import * as mongoose from 'mongoose';

export const TicketSchema = new mongoose.Schema({
  id: String,

  // owner
  hashedPassportId: String,
  hashedPin: String,

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

export interface TicketModel extends mongoose.Document {
  id: string,

  // owner
  hashedPassportId: string,
  hashedPin: string,

  reason: string,

  startAddress: {
    street: string,
    houseNumber: string,
    zipCode: string,
    city: string,
    country: string,
  },
  endAddress: {
    street: string,
    houseNumber: string,
    zipCode: string,
    city: string,
    country: string,
  },

  validFromDateTime: Date,
  validToDateTime: Date,
}