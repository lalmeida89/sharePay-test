'use strict';

const mongoose = require('mongoose');
const bcrypt   = require('bcrypt-nodejs');
mongoose.Promise = global.promise;

// define the schema for our user model
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

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
const User = mongoose.model('User', userSchema);
module.exports = {User}
