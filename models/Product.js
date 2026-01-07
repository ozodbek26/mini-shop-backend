const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  username: String,
  price: Number,
  productName: String,
  peculiarities: String,
  deliveryMethod: String,
  storageTime: String,
  category: String,
  hashtags: [String],
  images: [String],
  token: String,
});

module.exports = mongoose.model("Product", ProductSchema);
