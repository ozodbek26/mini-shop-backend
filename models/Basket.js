const mongoose = require("mongoose");

const BasketSchema = new mongoose.Schema({
  whoWantsuser: String,
  toWhomuser: String,
  product: String,
  date: Number,
  price: Number,
});

module.exports = mongoose.model("Basket", BasketSchema);
