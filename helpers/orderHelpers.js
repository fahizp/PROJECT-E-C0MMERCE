const { user } = require("../Model/connection");
const db = require("../Model/connection");
module.exports = {
    
  // Place Order //

  placeOrder: (order, total) => {
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
          $project: {
            _id: "$cartItems",
            quantity: 1,
            productName: "$cartItems.name",
            productPrice: "$cartItems.price",
            status: "$cartItems.status",
            Delivery: "$cartItems.Delivery",
          },
        },
      ]);

      let orderAddress = {
        fName: order.fName,
        lname: order.lName,
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
            totalprice: total,
            shippingAddress: address,
          },
        ],
      };

      let user_order = await db.order.findOne({ user: order.userId });

      if (user_order) {
        db.order
          .updateOne(
            { user: order.userId },
            {
              $push: {
                orders: [
                  {
                    fName: order.fName,
                    lName: order.lName,
                    mobile: order.mobile,
                    paymentMethod: order.paymentMethod,
                    productDetails: product,
                    totalPrice: total,
                    shippingAddress: address,
                  },
                ],
              },
            }
          )
          .then((a) => {})
          .catch((err) => console.log(err));
      } else {
        let orderData = await db.order(orderObj);
        await orderData.save();
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
            $unwind: "$orders.productDetails",
          },
          {
            $match: { userId: userId },
          },
          {
            $sort: { "order.createdAt": -1 },
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
            $match: { userId: userId },
          },
          {
            $sort: { "order.createdAt": -1 },
          },
        ])
        .then((data) => {
          resolve(data);
        })
        .catch((err) => console.log(err));
    });
  },

  getAdminOrdersDetailes: (userId) => {
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
            $sort: { "order.createdAt": -1 },
          },
        ])
        .then((data) => {
          resolve(data);
        })
        .catch((err) => console.log(err));
    });
  },
};
