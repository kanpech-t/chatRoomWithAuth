const mongoose = require("mongoose");

const UserRoomSchema = new mongoose.Schema({
  id: String,
  roomId: String,
});

module.exports = mongoose.model("UserRoom", UserRoomSchema);
