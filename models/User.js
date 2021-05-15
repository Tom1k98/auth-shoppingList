const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    dropDups: true,
  },
  password: {
    type: String,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
