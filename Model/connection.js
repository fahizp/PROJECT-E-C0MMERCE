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
  offerprice:Number,
  description: String,
  createdAt:Date,
});

// Admin Schema

const adminShema = new mongoose.Schema({
  email: String,
  password: Number,
});

// User Schema

const userShema = new mongoose.Schema({
  fName: String,
  lName: String,
  email: String,
  phoneNumber: Number,
  password: String,
  createdAt: {
        type: Date,
        default:new Date(),
      },
  status: {
    type: Boolean,
    default: true,
  },
  wallet:Array ,
  coupon: Array,
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



// Wishlist Schema

const wishlistSchema = new mongoose.Schema({
  user: ObjectId,
  wishlistProducts: [
    {
      item: mongoose.Types.ObjectId,
      status: {
        type: Boolean,
        default: false,
      },
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
      lName: String,
      mobile: Number,
      paymentMethod: String,
      productDetails: [{}],
      totalPrice: Number,
      shippingAddress: Object,
      createdAt:Date,
      uuid:String,
      paymentStatus: {
        type: String,
        default:'pending',
      },
      status: {
        type: Boolean,
        default: true,
      },
    },
  ],
});


const countryScheama =new mongoose.Schema({
  code:String,
  code3:String,
  name:String,
  number:Number
}) 




const couponSchema = new mongoose.Schema({
  coupon: String,
  discountType: String,
  amount: Number,
  amountValidity: String,
  cappedAmount:Number,
  percentage: Number,
  description: String,
  createdAt: {
      type: Date,
      default: new Date()
  },
  validityTill: Date,
  usageValidity: Number

})



const bannerSchema = new mongoose.Schema({
  mainBannerTitle: String,
  mainBannerDescription: String,
  mainBannerCategory : String,
  checked:{
      type:Boolean,
      default:true
  }
})

module.exports = {
  products: db.model("product", productSchema),
  admin: db.model("admin", adminShema),
  user: db.model("user", userShema),
  categories: db.model("categories", categorySchema),
  cart: db.model("cart", cartSchema),
  address: db.model("address", addressSchema),
  order: db.model("order", orderSchema),
  country:db.model('country',countryScheama),
  coupon: db.model('coupon', couponSchema),
  wishlist:db.model('wishlist',wishlistSchema),
  banner:db.model('banner',bannerSchema),
};
