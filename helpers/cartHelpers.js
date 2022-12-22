const { user } = require("../Model/connection");
const db = require("../Model/connection");
module.exports = {
  //  Add To Cart //

  addtocart: (proId, user) => {
    proObj = {
      item: proId,
      quantity: 1,
    };
    return new Promise(async (resolve, reject) => {
      let userCart = await db.cart.findOne({ user: user._id });
      if (userCart) {
        let prodExist = userCart.cartProducts.findIndex(
          (cartProducts) => cartProducts.item == proId
        );
        if (prodExist != -1) {
          db.cart
            .updateOne(
              { user: user._id, "cartProducts.item": proId },
              {
                $inc: {
                  "cartProducts.$.quantity": 1,
                },
              }
            )
            .then(() => {
              resolve();
            })
            .catch((err) => console.log(err));
        } else {
          console.log("usercart");
          db.cart
            .updateOne(
              { user: user._id },
              {
                $push: {
                  cartProducts: proObj,
                },
              }
            )
            .then(() => {
              resolve();
            })
            .catch((err) => console.log(err));
        }
      } else {
        let cartObj = {
          user: user._id,
          cartProducts: [proObj],
        };
        db.cart(cartObj)
          .save()
          .then(() => {
            resolve();
          })
          .catch((err) => console.log(err));
      }
    });
  },

  // get Cart Product //

  getCartProduct: (user) => {
    return new Promise((resolve, reject) => {
      db.cart
        .aggregate([
          {
            $match: { user: user._id },
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
            $project: {
              item: 1,
              quantity: 1,
              Product: { $arrayElemAt: ["$cartItems", 0] },
            },
          },
        ])
        .then((cartItems) => {
          resolve(cartItems);
        })
        .catch((err) => console.log(err));
    });
  },

  // Get Cart Cound //

  getCartCound: (user) => {
    return new Promise((resolve, reject) => {
      let cartCount = 0;
      db.cart
        .findOne({ user: user?._id })
        .then((cart) => {
          if (cart) {
            for (let i = 0; i < cart.cartProducts.length; i++) {
              cartCount += cart.cartProducts[i].quantity;
            }
          }
          resolve(cartCount);
        })
        .catch((err) => console.log(err));
    });
  },

  // Change Product Quantity //

  changeProductQuantity: (details, user) => {
    const id = details.product;
    const cartId = details.cart;
    count = parseInt(details.count);
    quantity = parseInt(details.quantity);
    return new Promise((resolve, reject) => {
      if (details.count == -1 && details.quantity == 1) {
        db.cart
          .updateOne(
            { user: user },
            {
              $pull: {
                cartProducts: { item: id },
              },
            }
          )
          .then((e) => {
            resolve({ removeProduct: true });
          })
          .catch((err) => console.log(err));
      }
      db.cart
        .updateOne(
          { _id: cartId, "cartProducts.item": id },
          {
            $inc: {
              "cartProducts.$.quantity": details.count,
            },
          }
        )
        .then(() => {
          resolve({ status: true });
        })
        .catch((err) => console.log(err));
    });
  },

  // Delete Cart Product //

  deleteCartProduct: (data, user) => {
    return new Promise((resolve, reject) => {
      const id = data.product;
      db.cart
        .updateOne(
          { user: user },
          {
            $pull: {
              cartProducts: { item: id },
            },
          }
        )
        .then((e) => {
          resolve({ removeProduct: true });
        })
        .catch((err) => console.log(err));
    });
  },

  // Get Total Amount //

  getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      db.cart
        .aggregate([
          {
            $match: {
              user: userId,
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
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$cartItems", 0] },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ["$product.price", "$quantity"] } },
            },
          },
        ])
        .then((total) => {
          resolve(total[0]?.total);
        })
        .catch((err) => console.log(err));
    });
  },

  checkCartQuantity: async (userId, proId) => {
    console.log(proId);
    return new Promise(async (resolve, reject) => {
        let cart = await db.cart.findOne({ user: userId })
        if (cart) {
            let cartIndex = cart?.cartProducts?.findIndex(cart => cart.item == proId)
            if (cartIndex == -1) {
              console.log('0');
              let quantity = 0
              resolve({ status: true, quantity: quantity })
            } else {
              console.log('685');
              
              let quantity = cart?.cartProducts[cartIndex]?.quantity
              console.log(quantity);
              resolve({ status: true, quantity: quantity })
            }
          } else {
          console.log('false');
            resolve({ status: false })
        }

    })

},
};
