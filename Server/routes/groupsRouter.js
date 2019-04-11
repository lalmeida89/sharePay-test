const express = require("express");
const router = express.Router();
const { Groups } = require("../models/groups");

router.get('/', (req,res) => {
  res.json({ message: 'groups page' });
  console.log('reached the groups page');
})

module.exports = router;
