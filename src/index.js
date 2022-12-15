require("dotenv").config();
const mongoose = require("mongoose");
const client = require("./communication/mqtt");
const URI = process.env.MONGO_ATLAS_URI;

mongoose.connect(
    URI,
    { useNewUrlParser: true },
    (err) => {
      if (err) {
        console.error("Failed to connect to MongoDB");
        process.exit(1);
      }
      console.log("Connected to Mongo Atlas database: dentistimoDB");
    }
  );

  


