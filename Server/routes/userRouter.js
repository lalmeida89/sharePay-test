const express = require("express");
const router = express.Router();
const { User } = require("../models/user");

router.get('/', (req,res) => {
  console.log("you're here");
  res.json({ message: req.body})
})

module.exports = router;
