const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Booking schema
const bookingSchema = new Schema({
  dentistid: { type: Schema.Types.ObjectId, ref: 'dentists'},
  userid: { type: Number },
  requestid: { type: Number },
  issuance: { type: Number },
  date: { type: Date },
  time: { type: String }
});

const booking = mongoose.model("bookings", bookingSchema);
module.exports = booking;
