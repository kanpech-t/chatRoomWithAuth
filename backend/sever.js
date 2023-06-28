const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const http = require("http");
const socketIO = require("socket.io");
const jwtAuth = require("socketio-jwt-auth");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");
const { Server } = require("socket.io");

require("dotenv").config();

// ======================= Router =======================

const login = require("./routes/login");
const chatRoom = require("./routes/chatRoom");

// ======================= Middleware =======================

const auth = require("./middleware/auth.js");

// ======================= Model =======================

const User = require("./models/User.js");
const room = require("./models/Room.js");
const userRoom = require("./models/UserRoom.js");
const message = require("./models/Message.js");

// ======================= Const =======================

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = 4000;
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://192.168.3.68:3000"],
  },
  // default is 1 MB
  maxHttpBufferSize: 4e6,
});

app.set("socketio", io);
// connect to mongodb

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB:", error);
  });

// ======================= Middleware =======================

app.use(
  cors({
    origin: ["http://localhost:3000", "http://192.168.3.68:3000"],
    credentials: true,
  })
);

app.use((req, res, next) => {
  if (req.path === "/login" || req.path === "/register/") {
    next();
  } else {
    auth(req, res, next);
  }
});

// ======================= Socket =======================

io.use(
  jwtAuth.authenticate(
    {
      secret: process.env.SECRET_KEY,
      algorithm: "HS256", // optional, default to be HS256
    },
    async function (payload, done) {
      try {
        const user = await User.findOne({ id: payload.id });
        if (user) {
          // return user
          return done(null, user);
        } else {
          // return fail with error message
          return done(null, false, "user does not exist");
        }
      } catch (err) {
        // return error

        return done(err);
      }
    }
  )
);

io.on("connection", (socket) => {
  console.log(`a user connected `);

  socket.emit("success", socket.request.user);

  socket.on("joinRoom", (data) => {
    console.log(data);
    socket.join(data.room);
    console.log(`Socket joined room: ${data.room}`);
    // io.to(data.room).emit("messageControl", {
    //   type: "inform",
    //   content: `${data.user} has joined the chat`,
    //   from: data.user,
    // });
  });

  socket.on("leftRoom", (data) => {
    console.log("leftRoom", data);
    io.to(data.room).emit("messageControl", {
      type: "inform",
      content: `${data.message}`,
      from: data.user,
    });
  });

  // accept message from frontend
  socket.on("messageControl", async (data) => {
    const createProduct = await message.create({
      type: data.type,
      messageId: uuidv4(),
      content: data.message,
      roomId: data.room,
      fromId: socket.request.user.id,
    });
    // sent message to user
    io.to(data.room).emit("messageControl", {
      type: data.type,
      content: data.message,
      from: data.user,
    });
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

module.exports = io;
// ======================= Router =======================

app.use("/", login);
app.use("/chatroom", chatRoom);
