const mqtt = require("mqtt");
const client = mqtt.connect("mqtt://localhost:1883");
const dentist = require("../models/dentist");
const booking = require("../models/booking");

const pubTopicList = {
  dataDentistResponse: "data/dentist/response",
  bookingConfirmed: "booking/confirmed/",
  bookingError: "booking/error/",
};
const subTopicList = {
  dataDentistRequest: "data/dentist/request",
  saveBooking: "booking/save",
};

client.on("connect", () => {
  console.log("Connected to the Mosquitto broker");
  client.subscribe(Object.values(subTopicList), { qos: 1 }, (err) => {
    if (!err) {
      // console.log(`Subscribed to topics: ${  }`);
    }
  });
});

