const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema({
  dentistid: { type: Schema.Types.ObjectId, ref: "dentists", required: true },
  userid: {
    type: String, required: [true, "Email is required"],
    validate: {
      validator: (userid) => {
        return userid.includes("@");
      },
      message: "Email must include the '@' symbol",
    },
  },
  name: {type: String, required: [true, "Name is required"]},
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
