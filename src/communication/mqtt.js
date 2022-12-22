const mqtt = require("mqtt");
const client = mqtt.connect("mqtt://localhost:1883");
const dentist = require("../models/dentist");
const { createBooking } = require("../models/booking");
const { checkIfAvailableTimeSlots, formatTimeIntervall, createConfirmation, validateThatDateIsInFuture } = require("../tools/util");
const { saveBooking } = require("./db");
const options = {
  qosOne: 1,
  qosTwo: 2,
};
const SAVING_ERROR = "Saving the booking was unsuccessful";
const NO_FREE_SLOTS_ERROR = "No free slots available";

const PUB_TOPICS_LIST = {
  dataDentistResponse: "data/dentist/response",
  bookingConfirmed: "booking/confirmed/",
  bookingError: "booking/error/",
};
const SUB_TOPICS_LIST = {
  dataDentistRequest: "data/dentist/request",
  saveBooking: "booking/save",
};

// MQTT related code was implemented with inspiration from https://www.npmjs.com/package/mqtt

client.on("connect", () => {
  console.log("Connected to the Mosquitto broker");
  client.subscribe(Object.values(SUB_TOPICS_LIST), (err) => {
    if (!err) {
      console.log(
        `Subscribed to topics: ${SUB_TOPICS_LIST.dataDentistRequest} & ${SUB_TOPICS_LIST.saveBooking}`
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
      handleBooking(message);
      break;
  }
});

/**
 * This method will query the database for all dentist clinics and their info and then publish that info
 */
function findAllDentists() {
  dentist.find({}, (err, dentists) => {
    if (err) {
      console.log(err);
    } else {
      client.publish(
        PUB_TOPICS_LIST.dataDentistResponse,
        JSON.stringify(dentists),
        options.qosOne
      );
      console.log(dentists);
    }
  });
}

 /**
  * This method will first check if there are free available slots at the chosen dentist clinic for the specific date & time.
  * If there is, the booking will be saved and a confirmation message published, if not, an error message will be published.
  * @param MQTTMessage The payload of the message received i.e. the booking
 */
  async function handleBooking(MQTTMessage) {
  const incomingBooking = JSON.parse(MQTTMessage);
  const sessionId = incomingBooking.sessionid;
  const clinicId = incomingBooking.dentistid;
  
  incomingBooking.time = await formatTimeIntervall(incomingBooking);
  const freeSlotsAvailable = await checkIfAvailableTimeSlots(incomingBooking);
  const dateIsValid = await validateThatDateIsInFuture(incomingBooking);

  if (freeSlotsAvailable && dateIsValid) {
    console.log(
      freeSlotsAvailable +
        ":  Free slots are available for this time & date at this clinic"
    );
    const newBooking = await createBooking(incomingBooking);
    try {
      await saveBooking(newBooking);
      await sendBookingConfirmation(newBooking, sessionId, clinicId);
    } catch(err) {
      console.log(err);
      await sendBookingError(sessionId, SAVING_ERROR);
    }
  } else {
    sendBookingError(sessionId, NO_FREE_SLOTS_ERROR);
    console.log(
      freeSlotsAvailable +
        ":  No free slots are available for this time & date at this clinic"
    );
  }
}

/**
 * This method is for sending a confirmation when a booking has been successfully saved in the database
 * @param {object} booking The booking that is being confirmed
 * @param {String} sessionId The session ID of the person making the booking
 * @param {Number} clinicId The one digit number ID of the clinic. 
 */
async function sendBookingConfirmation(booking, sessionId, clinicId) {
  let confirmation = await createConfirmation(booking, sessionId, clinicId)
  console.log(confirmation);
  client.publish(
    PUB_TOPICS_LIST.bookingConfirmed + sessionId,
    JSON.stringify(confirmation),
    options.qosTwo
  );
}

/**
 * This method is for sending an error message when a booking can't be successfully saved
 * @param {String} sessionId The session ID of the person making the booking
 * @param {String} errorMessage The error message being published to the person trying to make a booking
 */
 async function sendBookingError(sessionId, errorMessage) {
  client.publish(
    PUB_TOPICS_LIST.bookingError + sessionId,
    JSON.stringify(errorMessage),
    options.qosTwo
  );
}

module.exports = client;
