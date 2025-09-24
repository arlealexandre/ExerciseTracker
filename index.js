const express = require('express')
const bodyParser = require('body-parser')
require('dotenv').config()
const mongoose = require('mongoose')
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const app = express()
const cors = require('cors');
const user = require('./models/user');

let User = require(__dirname + "/models/User");
let Exercise = require(__dirname + "/models/Exercise");

/* Middlewares */

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}));

/* Repository */

const createAndSaveUser = (username, done) => {
  User.findOne({
    username: username
  }, (err, data) => {
    if (err) {
        done(err)
    } else if (!data) { // We create new user
      let newUser = new User({username: username})
        newUser.save((err, data) => {
          if (err) done(err)
          else done(null, data)
        })
    } else {
      done(null, data)
    }
  })
}

const allUsers = (done) => {
  User.find({}, (err, users) => {
    if (err) done(err)
    else done(null, users)
  });
}

/* Endpoints */

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// POST /api/users
app.post("/api/users", (req, res) => {
  const username = req.body.username
  createAndSaveUser(username, (err, data) => {
    if (err) {
      res.status(500).json({
        "error": err.message
      })
    } else {
      res.status(200).json({
        "_id": data._id,
        "username": data.username
      })
    }
  });
});

// GET /api/users
app.get("/api/users", (req, res) => {
  allUsers((err, data) => {
    if (err) {
      res.status(500).json({
        "error": err.message
      })
    } else {
      res.status(200).json(data)
    }
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
