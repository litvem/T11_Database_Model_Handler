const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  dentistid: { type: Schema.Types.ObjectId, ref: "dentists", required: true },
  userid: {
    type: String, required: [true, "Email is required"]
  },
  name: {type: String, required: [true, "Name is required"]},
  requestid: {
    type: Number,
    required: [true, "Request ID is required"],
    validate: {
      validator: (requestid) => {
        return requestid.toString().length == 2;
      },
      message: "Request ID must be two digits",
    },
  },
  issuance: {
    type: Number,
    required: [true, "Issuance number is required"],
    validate: {
      validator: (issuance) => {
        return issuance.toString().length == 13;
      },
      message: "Issuance number must be 13 digits",
    },
  },
  date: { type: Date, required: [true, "Date is required"] },
  time: { type: String, required: [true, "Time is required"] },
});

const booking = mongoose.model("bookings", bookingSchema);
module.exports = booking;
