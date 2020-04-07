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
