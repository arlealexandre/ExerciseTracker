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

const addExercise = (userId, description, duration, date, done) => {
  User.findById(userId, (err, userData) => {
    if (err) {
      done(err)
    } else if (!userData) {
      done(new Error('User not found'))
    } else {
      let newExercise = new Exercise({
        userId: userId,
        description: description,
        duration: duration,
        date: date ? new Date(date).toDateString() : new Date().toDateString()
      });
      newExercise.save((err, data) => {
        if (err) done(err)
        else done(null, data)
      });
    }
  });
}

const findUserById = (userId, done) => {
  User.findById(userId, (err, userData) => {
    if (err) done(err)
    else done(null, userData)
  }); 
}

const findAllExercises = (userId, done) => {
  Exercise.find({userId: userId}, (err, exercises) => {
    if (err) done(err)
    else done(null, exercises)
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

// POST /api/users/:_id/exercises
app.post("/api/users/:_id/exercises", (req, res) => {
  const userId = req.params._id
  const description = req.body.description
  const duration = req.body.duration
  const date = req.body.date

  addExercise(userId, description, duration, date, (err, data) => {
    if (err) {
      res.status(500).json({
        "error": err.message
      })
    } else {
      findUserById(userId, (err, userData) => {
        if (err) {
          res.status(500).json({
            "error": err.message
          })
        } else {
          res.status(200).json({
            "_id": userData._id,
            "username": userData.username,
            "description": data.description,
            "duration": data.duration,
            "date": data.date
          })
        }
      });
    }
  });
});

// GET /api/users/:_id/logs
app.get("/api/users/:_id/logs", (req, res) => {
  const userId = req.params._id
  const from = req.query.from
  const to = req.query.to
  const limit = req.query.limit
  findUserById(userId, (err, userData) => {
    if (err) {
      res.status(500).json({
        "error": err.message
      })
    } else {
      findAllExercises(userId, (err, exercises) => {
        if (err) {
          res.status(500).json({
            "error": err.message
          })
        } else {
          // Filter exercises by date range
          if (from) {
            exercises = exercises.filter(ex => new Date(ex.date) >= new Date(from))
          }
          if (to) {
            exercises = exercises.filter(ex => new Date(ex.date) <= new Date(to))
          }
          // Limit the number of exercises returned
          if (limit) {
            exercises = exercises.slice(0, limit)
          }
          res.status(200).json({
            "_id": userData._id,
            "count": exercises.length,
            "username": userData.username,
            "log": [...exercises.map(ex => ({
              description: ex.description,
              duration: ex.duration,
              date: ex.date.toDateString()
            }))]
          })
        }
      });
    }
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
