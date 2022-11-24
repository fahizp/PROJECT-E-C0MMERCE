const mongoose = require("mongoose");
const db = mongoose.createConnection("mongodb://localhost:27017/Evara");
const { ObjectID } = require("bson");
const { ObjectId } = require("mongodb");

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

// Cart Schema

const cartSchema = new mongoose.Schema({
  user: ObjectId,
  cartProducts: [
    {
      item: mongoose.Types.ObjectId,
      quantity: Number,
    },
  ],
});

// addressSchema

const addressSchema = new mongoose.Schema({
  user: mongoose.Types.ObjectId,
  address: [
    {
      fName: String,
      lName: String,
      address: String,
      landmark: String,
      town: String,
      country: String,
      postcode: Number,
      mobile: Number,
      email: String,
    },
  ],
});

//order Schema

const orderSchema = new mongoose.Schema({
  userId: mongoose.Types.ObjectId,
  orders: [
    {
      fName: String,
      lname: String,
      mobile: Number,
      paymentMethod: String,
      productDetails: [{}],
      totalPrice: Number,
      shippingAddress: Object,
      createdAt: {
        type: Date,
        default: new Date(),
      },
      status: {
        type: Boolean,
        default: true,
      },
    },
  ],
});

module.exports = {
  products: db.model("product", productSchema),
  admin: db.model("admin", adminShema),
  user: db.model("user", userShema),
  categories: db.model("categories", categorySchema),
  cart: db.model("cart", cartSchema),
  address: db.model("address", addressSchema),
  order: db.model("order", orderSchema),
};
