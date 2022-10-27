const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const crypto = require("crypto");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

const users = [];

app.get("/api/users", (req, res) => {
  res.json(users);
});

app.post("/api/users", (req, res) => {
  const { username } = req.body;
  const findUser = users.find((user) => user.username === username);
  if (findUser) {
    return res.json({
      username: findUser.username, 
      _id: findUser._id
    });
  }
  
  const result = {
    username: username,
    _id: crypto.randomBytes(16).toString("hex"),
    exercises: []
  }
  
  users.push(result);
  
  res.json({
    username: result.username, 
    _id: result._id
  });
  
});

app.post("/api/users/:_id/exercises", (req, res) => {
  const _id = req.params._id;
  const findUser = users.find((user) => user._id === _id);
  if (!findUser) return res.status(404).send({ error: "User Not found" });

  let { description, duration, date } = req.body;
  if (date) {
    date = new Date(date).toISOString();
  } else {
    date = new Date().toISOString();
  }
  
  const result = {
    username: findUser.username,
    date: date,
    description: description,
    duration: +duration,
    _id: findUser._id,
  };
  findUser.exercises.push(result);

  res.json({
    ...result,
    date: new Date(result.date).toDateString()
  });
});

app.get("/api/users/:_id/logs", (req, res) => {
  const _id = req.params._id;
  const { limit, from, to } = req.query;
  
  const findUser = users.find((user) => user._id === _id);
  if (!findUser) return res.status(404).send({ error: "User Not found" });
  let exercises = findUser.exercises;

  if (from && to) {
    exercises = exercises.filter((exercise) => {
      const fromDate = new Date(new Date(from).toISOString()).valueOf();
      const toDate = new Date(new Date(to).toISOString()).valueOf();
      const exerciseDate = new Date(exercise.date).valueOf();
      return exerciseDate >= fromDate && exerciseDate <= toDate;
    });
  }

  if (limit) {
    exercises = exercises.slice(0, +limit);
  }
  
  exercises = exercises.map((exercise) => {
    return {
      description: exercise.description,
      duration: exercise.duration,
      date: new Date(exercise.date).toDateString(),
    }
  });
  
  const result = {
    _id: findUser._id,
    username: findUser.username,
    count: exercises.length,
    log: exercises,
  };

  res.json(result)
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
