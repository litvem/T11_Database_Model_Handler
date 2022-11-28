const mqtt = require("mqtt");
const client = mqtt.connect("mqtt://localhost:1883");
const dentist = require("../models/dentist");
const booking = require("../models/booking");
const options = {
  qos: 1,
};

const pub_topics_list = {
  dataDentistResponse: "data/dentist/response",
  bookingConfirmed: "booking/confirmed/",
  bookingError: "booking/error/",
};
const sub_topics_list = {
  dataDentistRequest: "data/dentist/request",
  saveBooking: "booking/save",
};

// MQTT related code was implemented with inspiration from https://www.npmjs.com/package/mqtt

client.on("connect", () => {
  console.log("Connected to the Mosquitto broker");
  client.subscribe(Object.values(sub_topics_list), options, (err) => {
    if (!err) {
      console.log(
        `Subscribed to topics: ${sub_topics_list.dataDentistRequest} & ${sub_topics_list.saveBooking}`
      );
    }
  });
});

client.on("message", (topic, message) => {
  switch (topic) {
    case sub_topics_list.dataDentistRequest:
      findAllDentists();
      break;
    case sub_topics_list.saveBooking:
      saveBooking(message);
      break;
  }
});

function findAllDentists() {
  dentist.find({}, (err, dentists) => {
    if (err) {
      console.log(err);
    } else {
      client.publish(
        pub_topics_list.dataDentistResponse,
        JSON.stringify(dentists),
        options
      );
      console.log(dentists);
    }
  });
}

function saveBooking(MQTTMessage) {
  const bookingInJson = JSON.parse(MQTTMessage);
  const newBooking = new booking({
    dentistid: bookingInJson.dentistid,
    userid: bookingInJson.userid,
    requestid: bookingInJson.requestid,
    issuance: bookingInJson.issuance,
    date: bookingInJson.date,
    time: bookingInJson.time,
  });

  const sessionId = bookingInJson.sessionid;
  newBooking.save((err) => {
    if (!err) {
      sendBookingConfirmation(newBooking, sessionId);
    } else {
      console.log(err);
      // put error code here
    }
  });
}

function sendBookingConfirmation(booking, sessionId) {
  let confirmation = {
    userid: booking.userid,
    requestid: booking.requestid,
    time: booking.time,
  };
  console.log(confirmation);
  client.publish(pub_topics_list.bookingConfirmed + sessionId, JSON.stringify(confirmation));
}

module.exports = client;
