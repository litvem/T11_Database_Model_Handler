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

async function saveBooking(MQTTMessage) {
  const bookingInJson = JSON.parse(MQTTMessage);
  const sessionId = bookingInJson.sessionid;

  if (bookingInJson.time.substring(0, 1) === "0") {
    bookingInJson.time = bookingInJson.time.slice(1);
    if (bookingInJson.time.substring(5, 6) === "0") {
      bookingInJson.time =
        bookingInJson.time.substring(0, 5) + bookingInJson.time.substring(6);
    }
  }
  const freeSlotsAvailable = await checkIfAvailableTimeSlots(bookingInJson);

  console.log(freeSlotsAvailable + ": No free slots for this time & date at this clinic");
  if(freeSlotsAvailable) {
    const newBooking = new booking({
      dentistid: bookingInJson.dentistid,
      userid: bookingInJson.userid,
      requestid: bookingInJson.requestid,
      issuance: bookingInJson.issuance,
      date: bookingInJson.date,
      time: bookingInJson.time,
    });
    console.log(newBooking);
  
    newBooking.save((err) => {
      if (!err) {
        sendBookingConfirmation(newBooking, sessionId);
      } else {
        console.log(err);
        SendBookingError(sessionId);
      }
    });
  } else {
    SendBookingError(sessionId);
  }
}

function sendBookingConfirmation(booking, sessionId) {
  let confirmation = {
    userid: booking.userid,
    requestid: booking.requestid,
    time: booking.time,
    // email: booking.email
    // name: booking.name
  };
  console.log(confirmation);
  client.publish(
    pub_topics_list.bookingConfirmed + sessionId,
    JSON.stringify(confirmation)
  );
}

function SendBookingError(sessionId) {
  const errorMessage = "Booking was unsuccessful";
  client.publish(
    pub_topics_list.bookingError + sessionId,
    JSON.stringify(errorMessage)
  );
}

async function checkIfAvailableTimeSlots(incomingBooking) {
  let numberOfSlots = 0;
  let numberOfBookings = 0;
  let availableSlot = false;

  const foundDentist = await dentist.findById(incomingBooking.dentistid);
  console.log(foundDentist);
  numberOfSlots = foundDentist.dentists;

  const bookings = await booking.find({
    dentistid: incomingBooking.dentistid,
    date: incomingBooking.date,
    time: incomingBooking.time,
  });
  numberOfBookings = bookings.length;
  console.log(bookings);
  console.log(numberOfBookings);
  
  if (numberOfBookings < numberOfSlots) {
    availableSlot = true;
    console.log(availableSlot + "inside checkIfAvailableTimeSlots");
  }
  return availableSlot;
}

module.exports = client;
