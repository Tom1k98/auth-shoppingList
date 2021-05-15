const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const passport = require("passport");
const session = require("express-session");
const connectEnsureLogin = require("connect-ensure-login");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const LocalStrategy = require("passport-local");
require("dotenv").config();

const mongoUrl = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eznnv.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((msg) => console.log("connection to mongo ok"))
  .catch((err) => console.log(err));

app.use(
  session({
    secret: "123-456-789",
    saveUninitialized: false,
    resave: false,
  })
);

app.use(express.static("public"));
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy({ usernameField: "email" }, (username, password, done) => {
    User.findOne({ username: username }, (err, foundUser) => {
      console.log(foundUser);
      if (err) return done(err);
      if (!foundUser) {
        return done(null, false);
      }
      bcrypt.compare(password, foundUser.password, (err, res) => {
        if (err) return done(err);
        if (!res) {
          return done(null, false);
        } else {
          return done(null, foundUser);
        }
      });
    });
  })
);
passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/registrace", (req, res) => {
  res.sendFile(__dirname + "/signin.html");
});

app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});

app.post("/registrace", function (req, res) {
  User.findOne({ username: req.body.email }, (err, foundUser) => {
    if (foundUser) {
      res.json({ err: "User with given email already exists" });
    } else {
      const newUser = new User({
        username: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10),
      });
      newUser
        .save()
        .then((result) => res.redirect("/"))
        .catch((err) => console.log(err));
    }
  });
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);

const port = process.env.PORT || 3333;
app.listen(port, () => {
  console.log(`server running at port ${port}`);
});
