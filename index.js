const express = require("express");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const db = require("./db.json");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Home page");
});

app.get("/users", (req, res) => {
  res.json(db);
});

app.get("/users/:id", (req, res) => {
  const { id } = req.params;
  const user = db.find((u) => u.id == id);
  if (!user) {
    return res.status(404).json({
      message: "Not found user",
    });
  }
  return res.json(user);
});

app.post("/users", (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) {
    return res.status(401).json({
      message: "Dont convert body",
    });
  }
  const user = { id: uuidv4(), name, password: bcrypt.hashSync(password, 10) };
  db.push(user);
  return res.status(201).json(user);
});

app.patch("/users/:id", (req, res) => {
  const { id } = req.params;
  let userIndex = db.findIndex((u) => u.id == id);
  let user = db[userIndex];
  if (userIndex >= 0) {
    Object.keys(req.body).forEach((key) => {
      if (key === "password") {
        req.body[key] = bcrypt.hashSync(req.body[key], 10);
      }
      user[key] = req.body[key];
    });
    return res.json(user);
  }
  return res.status(404).json({
    message: "Not found user",
  });
});

app.delete("/users/:id", (req, res) => {
  const { id } = req.params;
  let userIndex = db.findIndex((u) => u.id == id);
  if (userIndex >= 0) {
    db.splice(userIndex, 1);
    return res.json({
      message: "Succesfull deleted",
    });
  }
  return res.status(404).json({
    message: "Not found user",
  });
});

//1234567

app.get("/auth/login", (req, res) => {
  const { name, password } = req.body;
  const user = db.find(
    (u) => u.name == name && bcrypt.compareSync(password, u.password)
  );
  if (user) {
    return res.send("Succesfull login");
  }
  return res.send("Invalid username or password");
});

app.listen(8080, () => console.log("Server is running on port 8080"));
