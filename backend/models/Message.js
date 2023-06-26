const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  messageId: String,
  roomId: String,
  content: String,
  fromId: String,
  type: String,
  time: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", MessageSchema);
