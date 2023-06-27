const express = require("express");
const router = express.Router();
const message = require("../models/Message.js");
const userRoom = require("../models/UserRoom.js");
const user = require("../models/User.js");
const Room = require("../models/Room.js");
const { v4: uuidv4 } = require("uuid");

// const io = require("../sever.js");

// middleware
router.use(express.json());

router.get("/", async (req, res) => {
  try {
    const allRoom = await userRoom.find({ id: req.user.id });
    if (allRoom) {
      const result = await Promise.all(
        allRoom.map(async (data) => {
          const userDetail = await Room.findOne({ roomId: data.roomId });
          return userDetail;
        })
      );
      return res.json(result);
    }
  } catch (err) {}
});

router.get("/:roomId", async (req, res, next) => {
  try {
    const allMessage = await message.find({ roomId: req.params.roomId });

    if (allMessage) {
      const result = await Promise.all(
        allMessage.map(async (data) => {
          const userDetail = await user.findOne({ id: data.fromId });
          return {
            type: data.type,
            content: data.content,
            from: userDetail.username,
          };
        })
      );

      return res.json(result);
    }
  } catch (err) {
    return res.status(500).json("error");
  }
});

router.post("/create", async (req, res) => {
  try {
    roomId = req.body.roomId;
    roomName = req.body.roomName;
    userId = req.user.id;

    //  create in mongodb and user join room
    const checkRoomExist = await Room.findOne({ roomId: roomId });
    if (!checkRoomExist) {
      const createRoom = await Room.create({
        roomId: roomId,
        roomName: roomName,
      });
      const joinRoom = await userRoom.create({
        id: userId,
        roomId: roomId,
      });
      return res.json({ status: "success" });
    } else {
      return res.status(500).json({ message: "roomId already exist" });
    }
  } catch (err) {
    return res.status(500).json({ message: "something went wrong" });
  }
});

router.post("/join", async (req, res) => {
  const io = req.app.get("socketio");
  const userId = req.user.id;
  const roomId = req.body.roomId;
  let roomDuplicate = false;
  let roomExist = false;

  const allUserRoom = await userRoom.find({ id: req.user.id });
  allUserRoom.map((data) => {
    if (data.roomId === roomId) {
      roomDuplicate = true;
    }
  });
  if (roomDuplicate) {
    return res.status(500).json({ message: "already join the room" });
  }
  const allRoom = await userRoom.find();
  allRoom.map((data) => {
    if (data.roomId === roomId) {
      roomExist = true;
    }
  });

  if (!roomExist) {
    return res.status(500).json({ message: "room didn't exist" });
  }

  const joinRoom = await userRoom.create({
    id: userId,
    roomId: roomId,
  });
  io.to(roomId).emit("messageControl", {
    type: "inform",
    content: `${req.user.sub} has joined the chat`,
    from: req.user.sub,
  });
  const sendMessage = await message.create({
    type: "inform",
    messageId: uuidv4(),
    content: `${req.user.sub} has joined the chat`,
    roomId: roomId,
    fromId: req.user.id,
  });
  return res.json("success");
});

router.delete("/leave", async (req, res) => {
  try {
    const roomId = req.body.roomId;
    const io = req.app.get("socketio");
    const deleteRoom = await userRoom.deleteOne({
      roomId: roomId,
      id: req.user.id,
    });
    if (deleteRoom.deletedCount === 1) {
      io.to(roomId).emit("messageControl", {
        type: "inform",
        content: `${req.user.sub} has left the chat`,
        from: req.user.sub,
      });
      const sendMessage = await message.create({
        type: "inform",
        messageId: uuidv4(),
        content: `${req.user.sub} has left the chat`,
        roomId: roomId,
        fromId: req.user.id,
      });
      return res.json({ message: "success" });
    } else {
      return res.status(500).json({ message: "you didn't join that room" });
    }
  } catch (err) {}
});

module.exports = router;
