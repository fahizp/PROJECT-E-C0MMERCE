require("dotenv").config();
const db = require("../Model/connection");
const productHelpers = require("../helpers/productHelpers");
const adminHelpers = require("../helpers/adminHelpers");
const userHelpers = require("../helpers/userHelpers");
const session = require("express-session");
const { response } = require("../app");
const otp = require("../helpers/otpHelpers");
const cartHelpers = require("../helpers/cartHelpers");
const chartHelpers = require("../helpers/chartHelpers");
const orderHelpers = require("../helpers/orderHelpers");
const bannerHelpers = require("../helpers/bannerHelpers");
const client = require("twilio")(otp.accoundSid, otp.authToken);
const { Convert } = require("easy-currencies");

const paypal = require("@paypal/checkout-server-sdk");
const couponHelpers = require("../helpers/couponHelpers");
const Environment =
  process.env.NODE_ENV === "production"
    ? paypal.core.LiveEnvironment
    : paypal.core.SandboxEnvironment;
const paypalClient = new paypal.core.PayPalHttpClient(
  new Environment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  )
);
let couponPrice = 0;
module.exports = {
  //LandinPage

  indexPage: async (req, res, next) => {
    try {
      req.session.returnUrl = req.originalUrl;
      let user = req?.session?.user;
      let cartCount = await cartHelpers?.getCartCound(user);
      let wishlistCount = await userHelpers?.getwishlistCound(user);
      let banner = await db.banner.find({})
      let wishlistProducts = await userHelpers?.getwishlistProducts(
        req?.session?.user?._id
      );

      productHelpers
        .getAllproduct()
        .then((product) => {
          res.render("index", {
            user,
            product: product.product,
            cartCount,
            wishlistCount,
            wishlistProducts,
            banner,
          });
        })
        .catch((err) => {
          res.render("user/500Page");
          console.log(err);
        });
    } catch (error) {
      res.render("user/500Page");
    }
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
      res.render("user/500Page");
      console.log(error);
    }
  },

  //User SignUp

  postUsersignup: (req, res) => {
    try {
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
        .catch((err) => {
          res.render("user/500Page");
          console.log(err);
        });
    } catch (error) {
      res.render("user/500Page");
    }
  
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
      res.render("user/500Page");
      console.log(error);
    }
  },

  //User Login Post

  postUsersignin: (req, res) => {
    try {
      userHelpers
      .doLogin(req.body)
      .then((response) => {
        if (response.status) {
          req.session.user = response.user;
          req.session.userIn = true;
          res.send({ value: "Successlogin", url: req.session.returnUrl });
        } else if (!response.user.status) {
          res.send({ value: "block" });
        } else {
          // res.session.userIn = false;
          res.send({ value: "errorlogin" });
        }
      })
      .catch((err) => {
        res.render("user/500Page");
        console.log(err);
      });
    } catch (error) {
      res.render("user/500Page");
    }
  
  },

  // User Logout

  getUserlogout: async (req, res) => {
    try {
      req.session.user = await null;
      req.session.userIn = false;
      res.clearCookie();
      res.redirect("/user_signin");
    } catch (error) {
      res.render("user/500Page");
      console.log(error);
    }
  },

  //Otp Login

  getOtpPage: (req, res) => {
    try {
      res.render("user/user_otpLogin", { nav: true });
    } catch (error) {
      res.render("user/500Page");
      console.log(error);
    }
  },

  // Otp Send

  getOtplogin: (req, res) => {
    try {
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
      .catch((err) => {
        res.render("user/500Page");
        console.log(err);
      });  
    } catch (error) {
      res.render("user/500Page");
    }
 
  },

  //Otp Verify

  getOtpverify: (req, res) => {
    try {
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
      .catch((err) => {
        res.render("user/500Page");
        console.log(err);
      });
    } catch (error) {
      res.render("user/500Page");
    }
   
  },

  //Product Page

  getProductPage: async (req, res) => {
    try {
      req.session.returnUrl = req.originalUrl;
      let proId = req.params.id;
      let user = req.session.user;
      let cartCount = await cartHelpers.getCartCound(user);
      let wishlistCount = await userHelpers?.getwishlistCound(user);
      productHelpers
        .getProduct(proId)
        .then((product) => {
          res.render("user/product", { product, user, cartCount, wishlistCount });
        })
        .catch((err) => {
          res.render("user/500Page");
          console.log(err);
        });
    } catch (error) {
      res.render("user/500Page");
    }

  },

  //Cart Page

  getCartpage: async (req, res) => {
    try {
      req.session.returnUrl = req.originalUrl;
      req.session.returnTo = req.originalUrl;
      let user = req.session.user;
      let cartCount = await cartHelpers.getCartCound(user);
      let total = await cartHelpers.getTotalAmount(req.session.user._id);
      let wishlistCount = await userHelpers?.getwishlistCound(user);
      cartHelpers
        .getCartProduct(req.session.user)
        .then((cartItems) => {
          if (cartCount) {
            res.render("user/cart", {
              user,
              cartItems,
              cartCount,
              total,
              wishlistCount,
            });
          } else {
            res.render("user/emptyCart", { cartCount, user });
          }
        })
        .catch((err) => {
          res.render("user/500Page");
          console.log(err);
        });
    } catch (error) {
      res.render("user/500Page");
    }
  },

  //Add To Cart//

  getAdtoCart: async (req, res) => {
    try {
      req.session.returnUrl = req.originalUrl;

      cartHelpers
        .addtocart(req.params.id, req.session.user)
        .then(() => {
          res.json({ status: true });
        })
        .catch((err) => {
          res.render("user/500Page");
          console.log(err);
        });
    } catch (error) {
      res.render("user/500Page");
    }
   
  },

  // Change Product Quantity //

  changeProductQuantity: async (req, res) => {
    try {
      req.session.returnUrl = req.originalUrl;
      let total = await cartHelpers.getTotalAmount(req.session.user._id);
  
      cartHelpers
        .changeProductQuantity(req.body, req.session.user._id)
        .then((response) => {
          res.json({ status: true, total });
        })
        .catch((err) => {
          res.render("user/500Page");
          console.log(err);
        });
    } catch (error) {
      res.render("user/500Page");
    }
  
  },

  // Delete Cart Product //

  deleteCartProduct: (req, res) => {
    try {
      req.session.returnUrl = req.originalUrl;
      cartHelpers
        .deleteCartProduct(req.body, req.session.user._id)
        .then((response) => {
          res.json(response);
        })
        .catch((err) => {
          res.render("user/500Page");
          console.log(err);
        });
    } catch (error) {
      res.render("user/500Page");
    }
  
  },

  // CheckOut //

  checkOut: async (req, res) => {
    try {
      req.session.returnUrl = req.originalUrl;
      let user = req.session.user;
      let cartCount = await cartHelpers.getCartCound(user);
      let cartItems = await cartHelpers.getCartProduct(user);
      let total = await cartHelpers.getTotalAmount(req.session.user._id);
      let address = await db.address.find({ user: req.session.user._id });
      let country = await db.country.find({});
      let wishlistCount = await userHelpers?.getwishlistCound(user);

      if (cartCount) {
        res.render("user/checkOut", {
          wishlistCount,
          total,
          cartCount,
          cartItems,
          user,
          address,
          country,
          paypalClientId: process.env.PAYPAL_CLIENT_ID,
        });
      } else {
        res.render("user/emptyCart", { cartCount, user,wishlistCount });
      }
    } catch (error) {
      console.log(error);
      res.render("user/500Page");
    }
  },

  // Place Order //

  placeOrder: async (req, res) => {
    try {
      req.session.returnUrl = req.originalUrl;
    req.body.userId = await req.session.user._id;
    let total = await cartHelpers.getTotalAmount(req.session.user._id);
    total = total - couponPrice;
    let totalPrice = total;
    let total1 = total;
    orderHelpers
      .placeOrder(req.body, total, couponPrice, req.session.user._id)

      .then((response) => {
        couponPrice = 0;
        if (req.body.paymentMethod == "COD") {
          res.json({ statusCod: true });
        } else if (req.body.paymentMethod == "razorpay") {
          orderHelpers
            .generateRazorPay(req.session.user._id, total)
            .then((response) => {
              res.json(response);
            });
        } else {
          res.json({ paypal: true, total: totalPrice });
        }
      })
      .catch((err) => {
        res.render("user/500Page");
        console.log(err);
      });
    } catch (error) {
      res.render("user/500Page");
    }
    
  },
  wishlist: async (req, res) => {
    try {
      req.session.returnUrl = req.originalUrl;
      let user = req.session.user;
      let cartCount = await cartHelpers.getCartCound(user);
      let wishlistCount = await userHelpers.getwishlistCound(user);
      userHelpers
        .getwishlistProducts(req.session.user._id)
        .then((wishlistItems) => {
          res.render("user/wishlist", {
            wishlistItems,
            cartCount,
            wishlistCount,
          });
        }).catch((err) => {
          res.render("user/500Page");
          console.log(err);
        });
    } catch (error) {
      res.render("user/500Page");
    }

  },
  addToWishlist: (req, res) => {
    try {
      req.session.returnUrl = req.originalUrl;
      userHelpers
        .addToWishlist(req.params.id, req.session.user._id)
        .then((response) => {
          res.json(response);
        }).catch((err) => {
          res.render("user/500Page");
          console.log(err);
        });
    } catch (error) {
      res.render("user/500Page");
    }
   
  },

  deleteWishlistProduct: (req, res) => {
    try {
      req.session.returnUrl = req.originalUrl;
      userHelpers
        .deleteWishlistProduct(req.body, req.session.user._id)
        .then((response) => {
          res.json(response);
        })
        .catch((err) => {
          res.render("user/500Page");
          console.log(err);
        });
    } catch (error) {
      res.render("user/500Page");
    }
 
  },

  // autofill //

  autofill: (req, res) => {
    try {
      req.session.returnUrl = req.originalUrl;
    let addressId = req.params.id;
    orderHelpers.getAddress(addressId, req.session.user._id).then((data) => {
      res.json(data)
    })
    .catch((err) => {
      res.render("user/500Page");
      console.log(err);
    });
    } catch (error) {
      res.render("user/500Page");
    }
    
  },

  // Cancel Order //

  cancelOrder: (req, res) => {
    try {
      req.session.returnUrl = req.originalUrl;
      orderHelpers.cancelOrder(req.body).then((resp) => {
        res.json(resp)
        .catch((err) => {
          res.render("user/500Page");
          console.log(err);
        });
      });
    } catch (error) {
      res.render("user/500Page");
    }
   
  },

  returnOrder: (req, res) => {
    try {
      req.session.returnUrl = req.originalUrl;
      data = req.body;
      orderHelpers.returnOrder(data, req.session.user._id).then((response) => {
        res.json(response);
      })
      .catch((err) => {
        res.render("user/500Page");
        console.log(err);
      });
    } catch (error) {
      res.render("user/500Page");
    }
  
  },

  account: async (req, res) => {
    try {
      req.session.returnUrl = req.originalUrl;
      let user = req.session.user;
      let userData = await db.user.find({ _id: user._id });
      let cartCount = await cartHelpers.getCartCound(user);
      let total = await cartHelpers.getTotalAmount(req.session.user._id);
      let orders = await orderHelpers.getOrders(req.session.user._id);
      let address = await db.address.find({ user: req.session.user._id });
      let country = await db.country.find({});
      let wishlistCount = await userHelpers?.getwishlistCound(user);
      res.render("user/account/dashboard", {
        wishlistCount,
        user,
        cartCount,
        total,
        orders,
        address,
        country,
        userData,
      });
    } catch (error) {
      res.render("user/500Page");
    }
   
  },

  orders: async (req, res) => {
    try {
      req.session.returnUrl = req.originalUrl;
      let orders = await orderHelpers.getOrders(req.session.user._id);
      let user = req.session.user;
      let cartCount = await cartHelpers.getCartCound(user);
      let wishlistCount = await userHelpers?.getwishlistCound(user);
  
      res.render("user/account/orderList", {
        wishlistCount,
        user,
        cartCount,
        orders,
      });
    } catch (error) {
      res.render("user/500Page");
    }
   
  },

  addressGet: async (req, res) => {
    try {
      req.session.returnUrl = req.originalUrl;
      let address = await db.address.find({ user: req.session.user._id });
      let country = await db.country.find({});
      let user = req.session.user;
      let cartCount = await cartHelpers.getCartCound(user);
      let wishlistCount = await userHelpers?.getwishlistCound(user);
      res.render("user/account/address", {
        wishlistCount,
        user,
        cartCount,
        address,
        country,
      });
    } catch (error) {
      res.render("user/500Page");
    }
   
  },

  verifypayment: (req, res) => {
    try {
      orderHelpers.verifypayment(req.body).then(() => {
        orderHelpers
          .changePaymentStatus(req.session.user, req.body["order[receipt]"])
          .then(() => {
            res.json({ status: true });
          })
          .catch((err) => {
            res.render("user/500Page");
            console.log(err);
          });
      });
    } catch (error) {
      res.render("user/500Page");
    }
   
  },

  //paypal order

  paypalOrder: async (req, res) => {
    try {
      let total = req.body.total;
      total = parseInt(total);
      const request = new paypal.orders.OrdersCreateRequest();
      const value = await Convert(total).from("INR").to("USD");
      let price = Math.round(value);
  
      request.prefer("return=representation");
      request.requestBody({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: price,
              breakdown: {
                item_total: {
                  currency_code: "USD",
                  value: price,
                },
              },
            },
          },
        ],
      });

      const order = await paypalClient.execute(request);
      res.json({ id: order.result.id });
    } catch (error) {
      res.render("user/500Page");
    }
  },

  //paypal success

  paypalSuccess: async (req, res) => {
    try {
      const ordersDetails = await db.order.find({ userId: req.session.user });
      let orders = ordersDetails[0].orders.slice().reverse();
      let orderId1 = orders[0]._id;
      let orderId = "" + orderId1;
  
      orderHelpers.changePaymentStatus(req.session.user._id, orderId).then(() => {
        res.json({ status: true });
      })
      .catch((err) => {
        res.render("user/500Page");
        console.log(err);
      });
    } catch (error) {
      res.render("user/500Page");
    }
   
  },

  checkCartQuantity: (req, res) => {
    try {
      cartHelpers
      .checkCartQuantity(req.session.user._id, req.params.id)
      .then((response) => {
        res.json(response);
      })
      .catch((err) => {
        res.render("user/500Page");
        console.log(err);
      });
    } catch (error) {
      res.render("user/500Page");
    }

  },

  shop: async (req, res) => {
    try {
      let product = await productHelpers.getAllproduct();
      let user = req.session.user;
      let cartCount = await cartHelpers.getCartCound(user);
      let wishlistCount = await userHelpers?.getwishlistCound(user);
  
      res.render("user/shop", {
        wishlistCount,
        product: product.product,
        cartCount,
        user,
      })
      .catch((err) => {
        res.render("user/500Page");
        console.log(err);
      }); 
    } catch (error) {
      res.render("user/500Page");
    }
  },

  deleteAddress: async (req, res) => {
    try {
      orderHelpers
      .deleteAddress(req.session.user._id, req.params.id)
      .then((response) => {
        res.json(response);
      })
      .catch((err) => {
        res.render("user/500Page");
        console.log(err);
      });
    } catch (error) {
      res.render("user/500Page");
    }
   
  },

  singleOrder: async (req, res) => {
    try {
      let user = req.session.user;
      let cartCount = await cartHelpers.getCartCound(user);
      let total = await cartHelpers.getTotalAmount(req.session.user._id);
      let wishlistCount = await userHelpers?.getwishlistCound(user);
      orderHelpers
        .getAdminOrdersDetailes(req.session.user._id, req.params.id)
        .then((orders) => {
          res.render("user/account/singleOrder", {
            wishlistCount,
            user,
            orders,
            total,
            cartCount,
          });
        })
        .catch((err) => {
          res.render("user/500Page");
          console.log(err);
        });
    } catch (error) {
      res.render("user/500Page");
    }
  
  },

  orderInvoice: async (req, res) => {
    try {
      proId = req.query.product;
      orderId = req.query.orderId;
      orderHelpers.orderInvoice(proId, orderId).then((response) => {
        res.json(response);
      })
      .catch((err) => {
        res.render("user/500Page");
        console.log(err);
      });
    } catch (error) {
      res.render("user/500Page");
    }
   
  },

  addAddress: async (req, res) => {
    try {
    orderHelpers.addAddress(req.body, req.session.user._id).then((response) => {
      res.json({ status: true })
      .catch((err) => {
        res.render("user/500Page");
        console.log(err);
      });
    }); 
    } catch (error) {
      res.render("user/500Page");
    }
   
  },

  profile: async (req, res) => {
    try {
      let user = req.session.user;
      let cartCount = await cartHelpers.getCartCound(user);
      let wishlistCount = await userHelpers?.getwishlistCound(user);
      res.render("user/account/profile", { wishlistCount, user, cartCount });
    } catch (error) {
      res.render("user/500Page");
    }

  },

  updateProfile: (req, res) => {
    try {
      userHelpers
      .updateProfile(req.body, req.session.user._id)
      .then((response) => {
        res.json(response);
      })
      .catch((err) => {
        res.render("user/500Page");
        console.log(err);
      });
    } catch (error) {
      res.render("user/500Page");
    }

  },

  editAddress: (req, res) => {
    try {
      let addressId = req.params.id;
      orderHelpers
        .editAddress(req.body, addressId, req.session.user._id)
        .then(() => {
          res.json({ status: true });
        })
        .catch((err) => {
          res.render("user/500Page");
          console.log(err);
        });
    } catch (error) {
      res.render("user/500Page");
    }
  
  },

  getBlogPage: async (req, res) => {
    try {
      let user = req.session.user;
      let cartCount = await cartHelpers.getCartCound(user);
      let wishlistCount = await userHelpers?.getwishlistCound(user);
      res.render("user/bolg", { wishlistCount, user, cartCount });
    } catch (error) {
      res.render("user/500Page");
    }

  },
  getContactPage: async (req, res) => {
    try {
      let user = req.session.user;
      let cartCount = await cartHelpers.getCartCound(user);
      let wishlistCount = await userHelpers?.getwishlistCound(user);
      res.render("user/about", { wishlistCount, user, cartCount });
    } catch (error) {
      res.render("user/500Page");
    }

  },

  verifyCoupon: (req, res) => {
    try {
      couponHelpers
      .verifyCoupen(req.body, req.session.user._id)
      .then((response) => {
        res.json(response);
      }).catch((err) => {
        res.render("user/500Page");
        console.log(err);
      }); 
    } catch (error) {
      res.render("user/500Page");
    }
 
  },

  couponChecked: async (req, res) => {
    try {
      let coupenCheck = req.body.couponCheck;
      couponHelpers
        .couponChecked(coupenCheck, req.session.user._id)
        .then((response) => {
          res.json(response);
        })
        .catch((err) => {
          res.render("user/500Page");
          console.log(err);
        }); 
    } catch (error) {
      res.render("user/500Page");
    }

  },
  applyCoupon: async (req, res) => {
    try {
      let couponName = req.body.couponName;
      let total = await cartHelpers.getTotalAmount(req.session.user._id);
      couponHelpers
        .applyCoupon(couponName, req.session.user, total)
        .then((response) => {
          couponPrice = response.discountAmount;
          res.json(response);
        })
        .catch((err) => {
          res.render("user/500Page");
          console.log(err);
        }); 
    } catch (error) {
      res.render("user/500Page");
    }
   
  },

  getProductData: async (req, res) => {
    try {
      let data = await productHelpers.getProductData();
      res.send(data);
    } catch (err) {
      res.render("user/500Page");
    }
  },

  getBannerShop:async(req,res)=>{
    try {
      let user = req.session.user;
    let cat=  req.query.category
    let wishlistCount = await userHelpers?.getwishlistCound(user);
    let cartCount = await cartHelpers.getCartCound(user);
    userHelpers.getBannerShop(cat).then((product)=>{
      res.render("user/shopCategory", {
        wishlistCount,
        product,
        cartCount,
        user,
      })
    })
    } catch (error) {
      
    }
  }
};
