const mongoose = require("mongoose");

const pasteSchema = new mongoose.Schema({
  data: String,
  link: String,
  password: String,
  title: String,
  expirationDate: String,
  dateCreated:Date
});

const pasteColl = new mongoose.model("pastes", pasteSchema);
module.exports = { pasteColl };
