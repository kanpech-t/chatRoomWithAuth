const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  roomId: String,
  roomName: String,
});

module.exports = mongoose.model("Room", RoomSchema);
