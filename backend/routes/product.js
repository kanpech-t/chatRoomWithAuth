const express = require("express");
const router = express.Router();
const Product = require("../models/Product.js");

// middleware
router.use(express.json());

router.get("/", async (req, res, next) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    console.log(req.body);
    const createProduct = await Product.create(req.body);

    res.json(createProduct);
  } catch (err) {
    return next(err);
  }
});

router.use((err, req, res, next) => {
  // Handle the error
  res.status(500).json({ error: err.message });
});

module.exports = router;
