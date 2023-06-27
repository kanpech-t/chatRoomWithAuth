const express = require("express");
const router = express.Router();
const message = require("../models/Message.js");
const userRoom = require("../models/UserRoom.js");
const user = require("../models/User.js");
const Room = require("../models/Room.js");
const { v4: uuidv4 } = require("uuid");

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
  return res.json("success");
});
// ไว้ก่อน เยอะชห
// router.put("/join", async (req, res, next) => {
//   try {
//     const userId = req.body.id;
//     const roomId = req.body.roomId;
//     if (!userId || !roomId) {
//       return res
//         .status(400)
//         .json({ message: "please sent data in your header" });
//     }
//     const userRoomDetail = userRoom.findOne({ id: userId });
//     if (!userRoomDetail) {
//       userRoom.create({
//         id: userId,
//         roomId: [roomId],
//       });
//     } else {
//       // put update เพิ่มห้องเข้าไป
//     }
//   } catch (err) {
//     return res.status(500).json({ error: err });
//   }
// });

module.exports = router;

// const userRoomDetail = userRoom.findOne({ id: userId });
