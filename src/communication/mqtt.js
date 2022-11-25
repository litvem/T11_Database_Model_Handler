const mqtt = require("mqtt");
const client = mqtt.connect("mqtt://localhost:1883");
const dentist = require("../models/dentist");
const booking = require("../models/booking");
const options = {
  qos: 1
}


const pub_topics_list = {
  dataDentistResponse: "data/dentist/response",
  bookingConfirmed: "booking/confirmed/",
  bookingError: "booking/error/",
};
const sub_topics_list = {
  dataDentistRequest: "data/dentist/request",
  saveBooking: "booking/save",
};

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
  }
});
  

function findAllDentists() {
  dentist.find({}, (err, dentists) => {
    if (err) {
      console.log(err);
    } else {
      client.publish(pub_topics_list.dataDentistResponse, JSON.stringify(dentists), options);
      console.log(dentists);
    }
  });
}

module.exports = client;
