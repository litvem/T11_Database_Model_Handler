const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// The Dentist schema
const dentistSchema = new Schema({
  id: { type: Number, required: [true, "Dentist ID is required"] },
  name: { type: String, required: [true, "Dentist name is required"] },
  owner: { type: String, required: [true, "Owner of clinic is required"]  },
  dentists: { type: Number, required: [true, "Number of dentists is required"]  },
  address: { type: String, required: [true, "Address is required"] },
  city: { type: String, required: [true, "City is required"] },
  coordinate: {
    longitude: { type: Number,  required: [true, "Longitude is required"] },
    latitude: { type: Number, required: [true, "Latitude is required"] },
  },
  openinghours: {
    monday: { type: String, required: [true, "Monday opening hours is required"] },
    tuesday: { type: String, required: [true, "Tuesday opening hours is required"] },
    wednesday: { type: String, required: [true, "Wednesday opening hours is required"] },
    thursday: { type: String, required: [true, "Thursday opening hours is required"]},
    friday: { type: String, required: [true, "Friday opening hours is required"] },
  },
});

const dentist = mongoose.model("dentists", dentistSchema);
module.exports = dentist;
