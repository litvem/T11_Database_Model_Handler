require("dotenv").config();
const mongoose = require("mongoose");
const URI = process.env.MONGO_ATLAS_URI;

mongoose.connect(URI, { useNewUrlParser: true }, (err) => {
  if (err) {
    console.error("Failed to connect to MongoDB");
    process.exit(1);
  }
  console.log("Connected to Mongo Atlas database: dentistimoDB");
});

/**
 * This method persists a booking in the database
 * @param {object} incomingBooking The booking to be saved
 */
async function saveBooking(incomingBooking) {
    // console.log("ERROR ABOUT TO BE THROWN")
    // throw new Error("ERROR THROWN")
    incomingBooking.save();
}

module.exports = {
  saveBooking,
};
