const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const User = require('../models/user');
const configAuth = require('./auth');

module.exports = function(passport) {
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
  passport.use('local-login', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
  },
  function(req, email, password, done) {
    if (email)
    email = email.toLowerCase();
    process.nextTick(function() {
      User.findOne({ 'local.email' :  email }, function(err, user) {
        if (err)
        return done(err);
        if (!user)
        return done(null, false, req.flash('loginMessage', 'No user found.'));
        if (!user.validPassword(password))
        return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
        else
        return done(null, user);
      });
    });
  }));
  passport.use('local-signup', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
  },
  function(req, email, password, done) {
    console.log(email);
    if (email)
    email = email.toLowerCase();
    process.nextTick(function() {
      if (!req.user) {
        User.findOne({ 'local.email' :  email }, function(err, user) {
          if (err)
          return done(err);
          if (user) {
            return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
          } else {
            const newUser = new User();
            newUser.local.email = email;
            newUser.local.music = req.body.music;
            newUser.local.password = newUser.generateHash(password);

            newUser.save(function(err) {
              if (err)
              return done(err);

              return done(null, newUser);
            });
          }
        });
      } else if ( !req.user.local.email ) {
        User.findOne({ 'local.email' :  email }, function(err, user) {
          if (err)
          return done(err);
          if (user) {
            return done(null, false, req.flash('loginMessage', 'That email is already taken.'));
          } else {
            const user = req.user;
            user.local.email = email;
            user.local.password = user.generateHash(password);
            user.save(function (err) {
              if (err)
              return done(err);

              return done(null,user);
            });
          }
        });
      } else {
        // user is logged in and already has a local account. Ignore signup. (You should log out before trying to create a new account, user!)
        return done(null, req.user);
      }
    });
  }));
  passport.use(new GoogleStrategy({

    clientID : configAuth.googleAuth.clientID,
    clientSecret : configAuth.googleAuth.clientSecret,
    callbackURL : configAuth.googleAuth.callbackURL,
    passReqToCallback : true
  },
  function(req, token, refreshToken, profile, done) {
    process.nextTick(function() {
      if (!req.user) {
        User.findOne({ 'google.id' : profile.id }, function(err, user) {
          if (err)
          return done(err);
          if (user) {
            if (!user.google.token) {
              user.google.token = token;
              user.google.name  = profile.displayName;
              user.google.email = (profile.emails[0].value || '').toLowerCase();
              user.save(function(err) {
                if (err)
                return done(err);

                return done(null, user);
              });
            }
            return done(null, user);
          } else {
            const newUser = new User();
            newUser.google.id = profile.id;
            newUser.google.token = token;
            newUser.google.name = profile.displayName;
            newUser.google.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email
            newUser.save(function(err) {
              if (err)
              return done(err);

              return done(null, newUser);
            });
          }
        });
      } else {
        const user = req.user;
        user.google.id = profile.id;
        user.google.token = token;
        user.google.name = profile.displayName;
        user.google.email = (profile.emails[0].value || '').toLowerCase(); // pull the first email
        user.save(function(err) {
          if (err)
          return done(err);
          return done(null, user);
        });
      }
    });
  }));
};
