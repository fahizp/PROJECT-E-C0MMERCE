const mongoose = require("mongoose");
const db = mongoose.createConnection("mongodb://localhost:27017/Evara");



db.on("error", (err) => {
  console.log(err);
});


db.once("open", () => {
  console.log("dataBase Connected");
});


// Products Schema

const productSchema = new mongoose.Schema({
  name: String,
  brand: String,
  category: String,
  quantity: Number,
  price: Number,
  description: String,
});

// Admin Schema

const adminShema = new mongoose.Schema({
  email: String,
  password: Number,
});


// User Schema

const userShema = new mongoose.Schema({
  username: String,
  email: String,
  phoneNumber: Number,
  password: String,
  status: {
    type: Boolean,
    default: true,
  },
});


// category Schema

const categorySchema = new mongoose.Schema({
  categories: String,
  description: String,
});






module.exports = {
  products: db.model("product", productSchema),
  admin: db.model("admin", adminShema),
  user: db.model("user", userShema),
  categories: db.model("categories", categorySchema),
};
