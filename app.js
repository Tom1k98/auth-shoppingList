const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const passport = require("passport");
const session = require("express-session");
const connectEnsureLogin = require("connect-ensure-login");
const User = require("./models/User");
(LocalStrategy = require("passport-local")), require("dotenv").config();

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

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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
  User.register(
    new User({ username: req.body.email }),
    req.body.password,
    function (err, user) {
      if (err) {
        console.log(err);
        return res.sendFile(__dirname + "/index.html");
      }
      User.authenticate("local")(req, res, function () {
        res.redirect("/");
      });
    }
  );
});

app.get("/", connectEnsureLogin.ensureLoggedIn(), (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err);
    }

    if (!user) {
      return res.redirect("/login");
    }

    req.logIn(user, function (err) {
      if (err) {
        return next(err);
      }

      return res.redirect("/");
    });
  })(req, res, next);
});

const port = process.env.PORT || 3333;
app.listen(port, () => {
  console.log(`server running at port ${port}`);
});
