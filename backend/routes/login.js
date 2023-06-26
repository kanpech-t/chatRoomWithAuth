const express = require("express");
const jwt = require("jwt-simple");
const passport = require("passport");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");

const router = express.Router();

// =================== envValue ===================
require("dotenv").config();
const SECRET = process.env.SECRET_KEY;

// =================== model ===================

const User = require("../models/User.js");

// =================== middleware ===================

router.use(cookieParser());
router.use(express.json());

// check username and password before create token
const loginMiddleware = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      return res.status(401).json({ error: "no user in database" });
    } else {
      const isMatch = await comparePasswords(req.body.password, user.password);
      if (user && isMatch) {
        req.body.id = user.id;
        next();
      } else {
        return res.status(401).json({ error: "wrong password" });
      }
    }
  } catch (err) {
    return res.status(500).json({ error: "Something went wrong " });
  }
};

// =================== function ===================

const hashPassword = async (password) => {
  try {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    throw new Error("Error hashing password");
  }
};

const comparePasswords = async (password, hashedPassword) => {
  try {
    const match = await bcrypt.compare(password, hashedPassword);
    return match;
  } catch (error) {
    throw new Error("Error comparing passwords");
  }
};

// =================== request ===================

router.post("/register", async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (user) {
      return res.status(401).json({ error: "user already exist" });
    }
    const hashedPassword = await hashPassword(req.body.password);
    const createProduct = await User.create({
      username: req.body.username,
      password: hashedPassword,
      id: uuidv4(),
    });

    return res.json(createProduct);
  } catch (err) {
    return next(err);
  }
});

router.post("/login", loginMiddleware, (req, res) => {
  const payload = {
    id: req.body.id,
    sub: req.body.username,
    iat: new Date().getTime(),
  };
  const token = jwt.encode(payload, SECRET);
  res.cookie("token", token, {
    maxAge: 3600000,
  });
  res.status(200).json({ message: "login success" });
});

router.get("/auth", (req, res) => {

  res.json({ message: "authority" });
});

module.exports = router;
