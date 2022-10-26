const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const crypto = require("crypto");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
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

  const { description, duration, date } = req.body;
  const result = {
    username: findUser.username,
    date: new Date(date || Date.now()).toDateString(),
    description: description,
    duration: +duration,
    _id: findUser._id,
  };
  findUser.exercises.push(result);
  res.json(result);
});

app.get("/api/users/:_id/logs?[from][&to][&limit]", (req, res) => {
  const _id = req.params._id;
  const { limit, from, to } = req.query || {};
  
  console.log("query", query)
  const findUser = users.find((user) => user._id === _id);
  if (!findUser) return res.status(404).send({ error: "User Not found" });
  let exercises = findUser.exercises;

  if (limit) {
    exercises = exercises.slice(0, +limit);
  }

  if (from && to) {
    exercises = exercises.filter((exercise) => {
      const fromDate = new Date(from).valueOf();
      const toDate = new Date(to).valueOf();
      const exerciseDate = new Date(exercise.date).valueOf();
      return exerciseDate >= fromDate && exerciseDate <= toDate;
    });
  }
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
