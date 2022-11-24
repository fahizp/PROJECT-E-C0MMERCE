const db = require("../Model/connection");

const productHelpers = require("../helpers/productHelpers");
const adminHelpers = require("../helpers/adminHelpers");
const userHelpers = require("../helpers/userHelpers");
const session = require("express-session");
const { response } = require("../app");
const otp = require("../helpers/otpHelpers");
const cartHelpers = require("../helpers/cartHelpers");
const orderHelpers = require("../helpers/orderHelpers");
const client = require("twilio")(otp.accoundSid, otp.authToken);

module.exports = {
  //LandinPage

  indexPage: async (req, res, next) => {
    let user = req.session.user;
    let cartCount = await cartHelpers.getCartCound(user);
    console.log("=>", cartCount);
    productHelpers
      .getAllproduct()
      .then((product) => {
        res.render("index", { user, product, cartCount });
      })
      .catch((err) => console.log(err));
  },

  //User SignUp

  getUsersignup: (req, res) => {
    try {
      if (req.session.userIn) {
        res.redirect("/");
      } else {
        res.render("user/user_registration", { nav: true });
      }
    } catch (error) {
      console.log(error);
    }
  },

  //User SignUp

  postUsersignup: (req, res) => {
    userHelpers
      .doSignup(req.body)
      .then((response) => {
        if (response.status) {
          req.session.user = response.user;
          req.session.userIn = true;
          res.send({ value: "Success" });
        } else {
          req.session.userIn = false;
          res.send({ value: "error" });
        }
      })
      .catch((err) => console.log(err));
  },

  //User Login

  getUsersiginin: (req, res) => {
    try {
      if (req.session.userIn) {
        res.redirect("/");
      } else {
        res.render("user/user_signin", { nav: true });
      }
    } catch (error) {
      console.log(error);
    }
  },

  //User Login Post

  postUsersignin: (req, res) => {
    userHelpers
      .doLogin(req.body)
      .then((response) => {
        if (response.status) {
          req.session.user = response.user;
          req.session.userIn = true;
          res.send({ value: "Successlogin" });
        } else if (!response.user.status) {
          res.send({ value: "block" });
        } else {
          // res.session.userIn = false;
          res.send({ value: "errorlogin" });
        }
      })
      .catch((err) => console.log(err));
  },

  // User Logout

  getUserlogout: (req, res) => {
    try {
      req.session.user = null;
      req.session.userIn = false;
      res.clearCookie();
      res.redirect("/user_signin");
    } catch (error) {
      console.log(error);
    }
  },

  //Otp Login

  getOtpPage: (req, res) => {
    try {
      res.render("user/user_otpLogin", { nav: true });
    } catch (error) {
      console.log(error);
    }
  },

  // Otp Send

  getOtplogin: (req, res) => {
    client.verify
      .services(otp.serviceId)
      .verifications.create({
        to: `+${req.query.phoneNumber}`,
        channel: req.query.channel,
      })
      .then((data) => {
        res.status(200).send(data);
        console.log(data);
      })
      .catch((err) => console.log(err));
  },

  //Otp Verify

  getOtpverify: (req, res) => {
    client.verify
      .services(otp.serviceId)
      .verificationChecks.create({
        to: `+${req.query.phoneNumber}`,
        code: req.query.code,
      })
      .then(async (data) => {
        if (data.valid) {
          let Number = data.to.slice(3);
          let userData = await db.user.findOne({ number: Number });
          req.session.user = userData;
          if (userData.status) {
            res.send({ value: "success" });
          } else {
            res.send({ value: "block" });
          }
        } else {
          res.send({ value: "failed" });
        }
      })
      .catch((err) => console.log(err));
  },

  //Product Page

  getProductPage: async (req, res) => {
    let proId = req.params.id;
    let user = req.session.user;
    let cartCount = await cartHelpers.getCartCound(user);
    productHelpers
      .getProduct(proId)
      .then((product) => {
        res.render("user/product", { product, user, cartCount });
      })
      .catch((err) => console.log(err));
  },

  //Cart Page

  getCartpage: async (req, res) => {
    let user = req.session.user;
    let cartCount = await cartHelpers.getCartCound(user);
    cartHelpers
      .getCartProduct(req.session.user)
      .then((cartItems) => {
        res.render("user/cart", { user, cartItems, cartCount });
      })
      .catch((err) => console.log(err));
  },

  //Add To Cart//

  getAdtoCart: async (req, res) => {
    cartHelpers
      .addtocart(req.params.id, req.session.user)
      .then(() => {
        console.log("api call");
        res.json({ status: true });
      })
      .catch((err) => console.log(err));
  },

  // Change Product Quantity //

  changeProductQuantity: async (req, res) => {
    cartHelpers
      .changeProductQuantity(req.body, req.session.user._id)
      .then((response) => {
        res.json(response);
      })
      .catch((err) => console.log(err));
  },

  // Delete Cart Product //

  deleteCartProduct: (req, res) => {
    cartHelpers
      .deleteCartProduct(req.body, req.session.user._id)
      .then((response) => {
        res.json(response);
      })
      .catch((err) => console.log(err));
  },

  // CheckOut //

  checkOut: async (req, res) => {
    try {
      let user = req.session.user;
      let cartCount = await cartHelpers.getCartCound(user);
      let cartItems = await cartHelpers.getCartProduct(user);
      let total = await cartHelpers.getTotalAmount(req.session.user._id);
      res.render("user/checkOut", { total, cartCount, cartItems, user });
    } catch (error) {
      console.log(error);
    }
  },

  // Place Order //

  placeOrder: async (req, res) => {
    req.body.userId = await req.session.user._id;
    let total = await cartHelpers.getTotalAmount(req.session.user._id);
    orderHelpers
      .placeOrder(req.body, total)
      .then((response) => {
        res.json(response);
      })
      .catch((err) => console.log(err));
  },
  // Orders //
  orders: async (req, res) => {
    let user = req.session.user;
    let cartCount = await cartHelpers.getCartCound(user);
    let total = await cartHelpers.getTotalAmount(req.session.user._id);
    orderHelpers
      .getOrders(req.session.user._id)
      .then((orders) => {
        res.render("user/orders", { user, orders, total, cartCount });
      })
      .catch((err) => console.log(err));
  },
};
