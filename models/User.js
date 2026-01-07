const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: String,
  username: String,
  Password: String,
  age: Number,
  img: String,
  status: { type: String, default: "покупатель" },
  aboutmyself: {
    type: String,
    default: "про вас нет никакой инфы напишите о себе :)",
  },
  balance: { type: Number, default: 0 },
});

module.exports = mongoose.model("User", UserSchema);
