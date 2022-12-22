const { orders } = require("../Controller/userController");
const { user, products } = require("../Model/connection");
var ObjectId = require("mongodb").ObjectID;
const db = require("../Model/connection");
const Razorpay = require("razorpay");
const { resolve } = require("path");
var voucher_codes = require("voucher-code-generator");

var instance = new Razorpay({
  key_id: "rzp_test_I16cKMa15BIgoA",
  key_secret: "TnRuhnvfSRJrFeAx7Jnkao7Y",
});

let code = voucher_codes.generate({
  length: 5,
  count: 1,
  charset: "0123456789",
  prefix: "Evara-",
});

module.exports = {
  // Place Order //

  placeOrder: (order, total,couponPrice,userId) => {
    console.log(order);
    return new Promise(async (resolve, reject) => {
      let product = await db.cart.aggregate([
        {
          $match: {
            user: order.userId,
          },
        },
        {
          $unwind: "$cartProducts",
        },
        {
          $project: {
            item: "$cartProducts.item",
            quantity: "$cartProducts.quantity",
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "item",
            foreignField: "_id",
            as: "cartItems",
          },
        },
        {
          $unwind: "$cartItems",
        },
        {
          $set: { cartItems: { status: true } },
        },
        {
          $set: { cartItems: { Delivery: "Processing" } },
        },
        {
          $set: { cartItems: { deliveredAt: undefined } },
        },
        {
          $project: {
            _id: "$cartItems._id",
            quantity: 1,
            productName: "$cartItems.name",
            productPrice: "$cartItems.price",
            status: "$cartItems.status",
            Delivery: "$cartItems.Delivery",
            deliveredAt: "$cartItems.deliveredAt",
          },
        },
      ]);

      let orderAddress = {
        fName: order.fName,
        lName: order.lName,
        address: order.address,
        landmark: order.landmark,
        town: order.town,
        country: order.country,
        postcode: order.postcode,
        mobile: order.mobile,
        email: order.email,
      };

      let addressObj = {
        user: order.userId,
        address: orderAddress,
      };

      let addressDoc = await db.address.findOne({ user: order.userId });

      if (addressDoc) {
        db.address
          .find({
            "address.fName": order.fName,
            "address.lName": order.lName,
            "address.postcode": order.postcode,
            "address.mobile": order.mobile,
          })
          .then((res) => {
            if (res.length == 0) {
              db.address
                .updateOne(
                  { user: order.userId },
                  {
                    $push: {
                      address: orderAddress,
                    },
                  }
                )
                .then((data) => {})
                .catch((err) => console.log(err));
            } else {
              console.log("exits");
            }
          })
          .catch((err) => console.log(err));
      } else {
        let addressdata = await db.address(addressObj);
        await addressdata.save();
      }

      for (let i = 0; i < product.length; i++) {
        await db.products.updateOne(
          {
            _id: product[i]._id,
          },
          {
            $inc: { quantity: -product[i].quantity },
          }
        );
      }

      let address = {
        address: order.address,
        landmark: order.landmark,
        town: order.town,
        city: order.city,
        country: order.country,
        postcode: parseInt(order.postcode),
        mobile: parseInt(order.mobile),
        email: order.email,
      };

      let orderObj = {
        userId: order.userId,
        orders: [
          {
            fName: order.fName,
            lName: order.lName,
            mobile: order.mobile,
            paymentMethod: order.paymentMethod,
            productDetails: product,
            createdAt: new Date(),
            totalPrice: total,
            shippingAddress: address,
            couponDiscount: couponPrice,
            couponName: order.couponName,
            uuid: code[0],
          },
        ],
      };

      let user_order = await db.order.findOne({ userId: order.userId });

      if (user_order) {
        console.log("und");
        db.order
          .updateOne(
            { userId: order.userId },
            {
              $push: {
                orders: [
                  {
                    fName: order.fName,
                    lName: order.lName,
                    mobile: order.mobile,
                    paymentMethod: order.paymentMethod,
                    productDetails: product,
                    createdAt: new Date(),
                    totalPrice: total,
                    shippingAddress: address,
                    couponDiscount: couponPrice,
                    couponName: order.couponName,
                    uuid: code[0],
                  },
                ],
              },
            }
          )
          .then((a) => {})
          .catch((err) => console.log(err));
      } else {
        console.log("illaa");
        let orderData = await db.order(orderObj);
        await orderData.save();
      }
      if (order.couponName) {
        console.log("enters");
        let userData =await db.user.findOne({ _id: order.userId, 'coupon.name': order.couponName })    
        console.log(userData.coupon);
        let couponIndex = await userData.coupon.findIndex(dataFind => dataFind.name == order.couponName)
        console.log(couponIndex);
        if (couponIndex>=0) {
          let dbuserCoupenUpdate =await db.user.updateOne({ _id: order.userId, 'coupon.name': order.couponName},{
            $set:{
              ['coupon.'+couponIndex+'.purchased']:true
            }
          })
          let dbCoupencount = await db.coupon.updateOne({ coupon: order.couponName }, {
            $inc: {
                usageValidity: -1
            }
        })
        console.log(dbuserCoupenUpdate);
        console.log(dbCoupencount);
        } 
      }
    
      db.cart
        .deleteMany({ user: order.userId })
        .then((res) => {
          resolve({ status: true });
        })
        .catch((err) => console.log(err));
    });
  },

  // Get Orders //

  getOrders: async (userId) => {
    return new Promise((resolve, reject) => {
      db.order
        .aggregate([
          {
            $unwind: "$orders",
          },

          {
            $match: { userId: userId },
          },
          {
            $sort: { "orders.createdAt": -1 },
          },
        ])
        .then((data) => {
          resolve(data);
        })
        .catch((err) => console.log(err));
    });
  },

  getAdminOrders: (userId) => {
    return new Promise((resolve, reject) => {
      db.order
        .aggregate([
          {
            $unwind: "$orders",
          },

          {
            $unwind: "$orders.productDetails",
          },
          {
            $sort: { "orders.createdAt": -1 },
          },
        ])
        .then((data) => {
          resolve(data);
        })
        .catch((err) => console.log(err));
    });
  },

  getAdminOrdersDetailes: (userId, orderId) => {
    return new Promise((resolve, reject) => {
      db.order
        .aggregate([
          {
            $unwind: "$orders",
          },
          { $match: { "orders._id": ObjectId(orderId) } },
          {
            $unwind: "$orders.productDetails",
          },
        ])
        .then((data) => {
          resolve(data);
        })
        .catch((err) => console.log(err));
    });
  },

  getAddress: (addressId, userId) => {
    return new Promise((resolve, reject) => {
      db.address
        .aggregate([
          {
            $match: { user: userId },
          },
          {
            $unwind: "$address",
          },
          {
            $match: { "address._id": ObjectId(addressId) },
          },
        ])
        .then((data) => {
          console.log("normal", data);
          console.log("invert", data.reverse());
          resolve(data);
        });
    });
  },

  cancelOrder: (data, userId) => {
    return new Promise(async (resolve, reject) => {
      let order = await db.order.find({ "orders._id": data.orderId });

      if (order) {
        let orderIndex = order[0].orders.findIndex(
          (order) => order._id == data.orderId
        );
        let productIndex = order[0].orders[orderIndex].productDetails.findIndex(
          (product) => product._id == data.proId
        );

        db.order
          .updateOne(
            { "orders._id": data.orderId },
            {
              $set: {
                ["orders." +
                orderIndex +
                ".productDetails." +
                productIndex +
                ".status"]: false,
              },
            }
          )
          .then((e) => {
            let quantity =
              order[0].orders[orderIndex].productDetails[productIndex].quantity;
            db.products.updateOne(
              {
                _id: data.proId,
              },
              {
                $inc: { quantity: quantity },
              }
            );
            resolve({ status: true });
          });
      }
    });
  },

  returnOrder: (data, userId) => {
    let orderId = data.orderId;
    let proId = data.proId;
    return new Promise(async (resolve, reject) => {
      let order = await db.order.find({ "order._id": `${orderId}` });
      let orderIndex = order[0].orders.findIndex(
        (order) => order._id == `${orderId}`
      );
      let productIndex = order[0].orders[orderIndex].productDetails.findIndex(
        (product) => product._id == `${proId}`
      );
      db.order
        .aggregate([
          {
            $match: { userId: ObjectId(userId) },
          },
          {
            $unwind: "$orders",
          },
          {
            $unwind: "$orders.productDetails",
          },
          {
            $match: {
              $and: [
                {
                  "orders._id": ObjectId(`${orderId}`),
                  "orders.productDetails._id": ObjectId(`${proId}`),
                },
              ],
            },
          },
          {
            $project: {
              _id: 0,
              dateDelivered: "$orders.productDetails.deliveredAt",
            },
          },
        ])
        .then((deliveryDate) => {
          let dateOrg = deliveryDate[0].dateDelivered;
          if (
            new Date(
              new Date(dateOrg).setDate(new Date(dateOrg).getDate() + 7) -
                new Date(dateOrg).setDate(new Date(dateOrg).getDate())
            ) <= 0
          ) {
            resolve({ status: false });
          } else {
            db.order
              .updateOne(
                { "orders._id": `${orderId}` },
                {
                  $set: {
                    ["orders." +
                    orderIndex +
                    ".productDetails." +
                    productIndex +
                    ".Delivery"]: "Product Returned",
                    ["orders." +
                    orderIndex +
                    ".productDetails." +
                    productIndex +
                    ".status"]: false,
                  },
                }
              )
              .then((e) => {
                db.order
                  .aggregate([
                    {
                      $match: { userId: ObjectId(userId) },
                    },
                    {
                      $unwind: "$orders",
                    },
                    {
                      $unwind: "$orders.productDetails",
                    },
                    {
                      $match: {
                        $and: [
                          {
                            "orders._id": ObjectId(orderId),
                            "orders.productDetails._id": ObjectId(proId),
                          },
                        ],
                      },
                    },
                  ])
                  .then((data) => {
                    
                     let  price= 0
                    
                    let totalPrice =
                      data[0].orders.productDetails.productPrice *
                      data[0].orders.productDetails.quantity;
                    console.log(totalPrice);
                    if (data[0].orders.totalPrice - totalPrice < 0) {
                       price = data[0].orders.totalPrice;
                    } else {
                      price = totalPrice;
                    }

                    db.products.updateOne(
                      { _id: ObjectId(proId) },
                      {
                        $inc: {
                          quantity: data[0].orders.productDetails.quantity,
                        },
                      }
                    );

                    db.user
                      .updateOne(
                        { _id: ObjectId(userId) },
                        {
                          $push: {
                            wallet: price,
                          },
                        }
                      )
                      .then((e) => {
                        resolve({ status: true });
                      });
                  });
              });
          }
        });
    });
  },

  updateOrder: (data) => {
    let orderId = data.orderId.trim();
    let proId = data.proId.trim();
    return new Promise(async (resolve, reject) => {
      let order = await db.order.find({ "orders._id": `${orderId}` });

      if (order) {
        let orderIndex = order[0].orders.findIndex(
          (order) => order._id == `${orderId}`
        );
        let productIndex = order[0].orders[orderIndex].productDetails.findIndex(
          (product) => product._id == `${proId}`
        );
        db.order
          .updateOne(
            { "orders._id": `${orderId}` },
            {
              $set: {
                ["orders." +
                orderIndex +
                ".productDetails." +
                productIndex +
                ".Delivery"]: data.delivery,
              },
            }
          )
          .then(async (e) => {
            if (data.delivery == "Delivered") {
              let updateDelDate = await db.order.updateOne(
                { "orders._id": `${orderId}` },
                {
                  $set: {
                    ["orders." +
                    orderIndex +
                    ".productDetails." +
                    productIndex +
                    ".deliveredAt"]: new Date(),
                  },
                }
              );
            }
            resolve({ status: true });
          });
      }
    });
  },

  generateRazorPay: async (userId, total) => {
    const orderDetailes = await db.order.find({ userId: userId });
    let length = orderDetailes[0].orders.length;
    let orderId = orderDetailes[0].orders[length - 1]._id;
    let userName = orderDetailes[0].orders[length - 1].fName;
    let mobile = orderDetailes[0].orders[length - 1].mobile;
    let email = orderDetailes[0].orders[length - 1].shippingAddress.email;
    total = total * 100;
    return new Promise((resolve, reject) => {
      try {
        var options = {
          amount: total,
          currency: "INR",
          receipt: "" + orderId,
        };
        instance.orders.create(options, function (err, order) {
          if (err) {
            console.log("razerpayErr:" + err);
          }

          order.userName = userName;
          order.mobile = mobile;
          order.email = email;

          console.log(order);

          resolve(order);
        });
      } catch (err) {
        console.log(err);
      }
    });
  },

  verifypayment: (data) => {
    return new Promise((resolve, reject) => {
      const crypto = require("crypto");
      let hmac = crypto.createHmac("sha256", "TnRuhnvfSRJrFeAx7Jnkao7Y");
      hmac.update(
        data["payment[razorpay_order_id]"] +
          "|" +
          data["payment[razorpay_payment_id]"]
      );
      hmac = hmac.digest("hex");
      if (hmac == data["payment[razorpay_signature]"]) {
        resolve();
      } else {
        reject("not match");
      }
    });
  },

  changePaymentStatus: (userId, orderId) => {
    return new Promise(async (resolve, reject) => {
      let orders = await db.order.find({ userId: userId });
      let orderIndex = orders[0].orders.findIndex(
        (order) => order._id == orderId
      );
      db.order
        .updateOne(
          {
            "orders._id": ObjectId(orderId),
          },
          {
            $set: {
              ["orders." + orderIndex + ".paymentStatus"]: "PAID",
            },
          }
        )
        .then((res) => {
          resolve();
        });
    });
  },

  deleteAddress: (userId, addressId) => {
    return new Promise(async (resolve, reject) => {
      try {
        db.address
          .updateOne(
            {
              userId: userId,
            },
            {
              $pull: { address: { _id: addressId } },
            }
          )
          .then((e) => {
            // console.log(e);
            resolve({ status: true });
          });
      } catch (err) {
        console.log(err);
      }
    });
  },

  orderInvoice: (proId, orderId) => {
    // console.log("===>",orderId,"<=====",proId);
    return new Promise(async (resolve, reject) => {
      try {
        let data = await db.order.aggregate([
          {
            $unwind: "$orders",
          },
          {
            $unwind: "$orders.productDetails",
          },
          {
            $match: {
              $and: [
                { "orders._id": ObjectId(orderId) },
                { "orders.productDetails._id": ObjectId(proId) },
              ],
            },
          },
        ]);
        resolve({ data: data[0], status: true });
      } catch (error) {}
    });
  },


  addAddress: (data, userId) => {
    console.log("data=>", data,userId);
    return new Promise(async (resolve, reject) => {
        try {
            let addressNew = {
                fName: data.fName,
                lName: data.lName,
                address: data.address,
                landmark: data.landmark,
                town: data.town,
                country: data.country,
                postcode: data.postcode,
                mobile: data.mobile,
                email: data.email
            }
            let addressObj = {
                user: userId,
                address: [addressNew]
            }
            let addressDoc = await db.address.findOne({ user: userId })

            if (addressDoc) {
                db.address.find({ 'address.fName': data.fName, 'address.lName': data.lName, 'address.postcode': data.postcode, 'address.mobile': data.mobile }).then((res) => {
                    console.log(res);
                    if (res.length == 0) {
                        console.log("Entered");
                        db.address.updateOne({ user: userId },
                            {
                                $push: {
                                    address: addressNew
                                }
                            }).then((data) => {
                                console.log(data);
                                resolve()
                            }).catch(err => console.log(err))
                    } else {
                        console.log("Exit")
                    }

                })
            } else {
                db.address(addressObj).save()
                resolve()
            }
        } catch (error) {
            console.log(error) 
        }
    })

},

editAddress:(data,id,userId)=>{
  console.log();
  return new Promise(async(resolve, reject) => {
    let addressObj=await db.address.find({user:userId})
    
if (addressObj) {
  let addressIndex=addressObj[0].address.findIndex(address=>address._id==id)
  let address = {
    fName: data.fName,
    lName: data.lName,
    address: data.address,
    landmark: data.landmark,
    town: data.town,
    country: data.country,
    postcode: data.postcode,
    mobile: data.mobile,
    email: data.email
}

db.address.updateOne({'address_id':id},{
  $set:{
    ['address.'+addressIndex]:address
  }
}).then((e)=>{
  console.log(e);
   resolve()
})
} 
   


  })
}
};
