const express = require("express");
const router = express.Router();
const message = require("../models/Message.js");
const userRoom = require("../models/UserRoom.js");
const user = require("../models/User.js");
const Room = require("../models/Room.js");
const { v4: uuidv4 } = require("uuid");

// middleware
router.use(express.json());

router.get("/:roomId", async (req, res, next) => {
  try {
    const allMessage = await message.find({ roomId: req.params.roomId });

    if (allMessage) {
      // ต้องเพิ่ม type ของ message นั้นๆด้วย
      const result = await Promise.all(
        allMessage.map(async (data) => {
          const userDetail = await user.findOne({ id: data.fromId });
          return {
            type: data.type,
            message: data.content,
            from: userDetail.username,
            img: data.content,
          };
        })
      );

      return res.json(result);
    }
  } catch (err) {
    return res.status(500).json("error");
  }
});

// ไว้ก่อน เยอะชห
router.put("/join", async (req, res, next) => {
  try {
    const userId = req.body.id;
    const roomId = req.body.roomId;
    if (!userId || !roomId) {
      return res
        .status(400)
        .json({ message: "please sent data in your header" });
    }
    const userRoomDetail = userRoom.findOne({ id: userId });
    if (!userRoomDetail) {
      userRoom.create({
        id: userId,
        roomId: [roomId],
      });
    } else {
      // put update เพิ่มห้องเข้าไป
    }
  } catch (err) {
    return res.status(500).json({ error: err });
  }
});

module.exports = router;

// const userRoomDetail = userRoom.findOne({ id: userId });
