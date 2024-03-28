"use strict";

const mongoose = require("mongoose");
const {
  db: { host, port, name },
} = require("../configs/config.mongodb");
const connectString = `mongodb://${host}:${port}/${name}`;
console.log("connectString: ", connectString);

const { countConnect } = require("../helpers/check.connect");

class Database {
  constructor() {
    this._connect();
  }
  // connect
  _connect(type = "mongodb") {
    // dev
    if (1 === 1) {
      mongoose.set("debug", true);
      mongoose.set("debug", { color: true });
    }
    mongoose
      .connect(connectString)
      .then((_) => console.log("Connected to MongoDB Pro", countConnect()))
      .catch((err) => console.log("Error connecting to MongoDB", err));
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new Database();
    }
    return this.instance;
  }
}

const instanceMongodb = Database.getInstance();

module.exports = instanceMongodb;
