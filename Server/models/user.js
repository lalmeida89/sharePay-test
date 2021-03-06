'use strict';

const mongoose = require('mongoose');
const bcrypt   = require('bcrypt-nodejs');
//mongoose.Promise = global.promise;

const userSchema = mongoose.Schema({
  name : String,
  groups: Array,
  local : {
    email : String,
    password : String,
    music : String

  },
  google : {
    id : String,
    token : String,
    email : String,
    name : String
  }
});

userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

const User = mongoose.model('User', userSchema);
module.exports = {User}
