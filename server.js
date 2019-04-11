const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const { DATABASE_URL, PORT } = require('./Server/config/database');
const app = express();
const port = process.env.PORT || 8080;
const passport = require('passport');
const flash = require('connect-flash')
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const userRouter = require('./Server/routes/userRouter');
const config = require('./secrets')
//const groupRouter = require('./Server/routes/groupsRouter');

//mongoose.Promise = global.Promise;
mongoose.connect(DATABASE_URL);

require('./Server/config/passport')(passport);

app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

app.use(session({
    secret: config.secret,
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));
console.log(path.join(__dirname, 'public'));

//require('./app/routes.js')(app, passport);

app.get('/', (req, res) => {
  console.log('youre home');
  res.json({message: 'testing JSON'})
})

app.use("/user", userRouter);
//app.use("/group", groupsRouter);

let server;

function runServer(databaseUrl, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { runServer, app, closeServer };
