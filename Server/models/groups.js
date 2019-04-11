'use strict';

const mongoose = require('mongoose');
//mongoose.Promise = global.promise;

const groupSchema = mongoose.Schema({
  users: Array,
  groupName: {type: String, required: true},
  created: {type: Date, default: Date.now},
  createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

groupSchema.pre('find', function(next){
  this.populate('user')
  next()
})

groupSchema.pre('findOne', function(next){
  this.populate('user')
  next()
})

groupSchema.virtual('groupCreator').get(function(){
  return `${this.user.name}`.trim();
})


groupSchema.methods.serialize = function() {
  return {
    id: this._id,
    users: this.users,
    groupName: this.groupName,
    created: this.created,
    createdBy: this.groupCreator
  };
};

const Groups = mongoose.model('Groups', groupSchema);
module.exports = {Groups}
