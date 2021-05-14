const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const passport = require("passport");
const session = require("express-session");
const connectEnsureLogin = require("connect-ensure-login");
const User = require("./models/User");

require("dotenv").config();

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

passport.use(User.createStrategy());
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

const mongoUrl = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eznnv.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((msg) => console.log("connection to mongo ok"))
  .catch((err) => console.log(err));

app.get("/registrace", (req, res) => {
  res.sendFile(__dirname + "/signin.html");
});

app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});

app.post("/registrace", (req, res) => {
  User.register(
    { username: req.body.email },
    req.body.password,
    (err, user) => {
      if (err) {
        console.log(err);
        res.redirect("/registrace");
      } else {
        User.authenticate("local")(req, res, () => {
          res.redirect("/");
        });
      }
    }
  );
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

const port = process.env.PORT || 3333;
app.listen(port, () => {
  console.log(`server running at port ${port}`);
});
