const googleSecrets = require('./../../secrets').googleAuth

module.exports = {
  'googleAuth' : {
      'clientID' : googleSecrets.clientID,
      'clientSecret' : googleSecrets.clientSecret,
      'callbackURL' : googleSecrets.callbackURL
  }
};
