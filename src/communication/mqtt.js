const mqtt = require("mqtt");
const client = mqtt.connect("mqtt://localhost:1883");
const dentist = require("../models/dentist");
const booking = require("../models/booking");
const options = {
  qos: 1,
};
const ERROR_MESSAGE = "Booking was unsuccessful";

const PUB_TOPICS_LIST = {
  dataDentistResponse: "data/dentist/response",
  bookingConfirmed: "booking/confirmed/",
  bookingError: "booking/error/",
};
const SUB_TOPICS_LIST = {
  dataDentistRequest: "data/dentist/request",
  saveBooking: "booking/save",
  cbOpen: "circuitbreak/open",
  cbClose: "circuitbreak/close"
};

// MQTT related code was implemented with inspiration from https://www.npmjs.com/package/mqtt

client.on("connect", () => {
  console.log("Connected to the Mosquitto broker");
  client.subscribe(Object.values(SUB_TOPICS_LIST), options, (err) => {
    if (!err) {
      console.log(
        `Subscribed to topics: ${SUB_TOPICS_LIST.dataDentistRequest}, ${SUB_TOPICS_LIST.saveBooking}, ${SUB_TOPICS_LIST.cbOpen} & ${SUB_TOPICS_LIST.cbClose}`
      );
    }
  });
});

client.on("message", (topic, message) => {
  switch (topic) {
    case SUB_TOPICS_LIST.dataDentistRequest:
      findAllDentists();
      break;
    case SUB_TOPICS_LIST.saveBooking:
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
        PUB_TOPICS_LIST.dataDentistResponse,
        JSON.stringify(dentists),
        options
      );
      console.log(dentists);
    }
  });
}

// This method will first check if there are free available at the chosen dentist clinic for the specific date & time.
// If there is, the booking will be saved and a confirmation message published, if not, an error message will be published. 
async function saveBooking(MQTTMessage) {
  const incomingBooking = JSON.parse(MQTTMessage);
  const sessionId = incomingBooking.sessionid;

  incomingBooking.time = await formatTimeIntervall(incomingBooking);
  const freeSlotsAvailable = await checkIfAvailableTimeSlots(incomingBooking);

  if(freeSlotsAvailable) {
    console.log(freeSlotsAvailable + ":  Free slots are available for this time & date at this clinic");
    const newBooking = await createBooking(incomingBooking);
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
    console.log(freeSlotsAvailable + ":  No free slots are available for this time & date at this clinic");
  }
}

// This is a method for sending a confirmation when a booking has been successfully saved in the database
function sendBookingConfirmation(booking, sessionId) {
  let confirmation = {
    userid: booking.userid,
    requestid: booking.requestid,
    time: booking.time,
    // name: booking.name
  };
  console.log(confirmation);
  client.publish(
    PUB_TOPICS_LIST.bookingConfirmed + sessionId,
    JSON.stringify(confirmation)
  );
}

// This is a method for sending an error message when a booking can't be successfully saved
function SendBookingError(sessionId) {
  client.publish(
    PUB_TOPICS_LIST.bookingError + sessionId,
    JSON.stringify(ERROR_MESSAGE)
  );
}

// This method will double check if there are free time slots for the incoming booking's time & date at the dentist clinic
async function checkIfAvailableTimeSlots(incomingBooking) {
  let numberOfSlots = 0;
  let numberOfBookings = 0;
  let hasAvailableSlot = false;

  const foundDentist = await dentist.findById(incomingBooking.dentistid);
  numberOfSlots = foundDentist.dentists;

  const bookings = await booking.find({
    dentistid: incomingBooking.dentistid,
    date: incomingBooking.date,
    time: incomingBooking.time,
  });
  numberOfBookings = bookings.length;
  console.log(numberOfBookings);
  
  if (numberOfBookings < numberOfSlots) {
    hasAvailableSlot = true;
  }
  return hasAvailableSlot;
}


async function createBooking(incomingBooking) {
  return new booking({
    dentistid: incomingBooking.dentistid,
    userid: incomingBooking.userid,
    requestid: incomingBooking.requestid,
    issuance: incomingBooking.issuance,
    date: incomingBooking.date,
    time: incomingBooking.time,
  });
}

async function formatTimeIntervall(incomingBooking) {
  if (incomingBooking.time.substring(0, 1) === "0") {
    incomingBooking.time = incomingBooking.time.slice(1);
    if (incomingBooking.time.substring(5, 6) === "0") {
      incomingBooking.time =
        incomingBooking.time.substring(0, 5) + incomingBooking.time.substring(6);
    }
  } 
  return incomingBooking.time;
}

module.exports = client;
