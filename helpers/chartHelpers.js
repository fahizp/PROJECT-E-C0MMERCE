const { user } = require("../Model/connection");
const db = require("../Model/connection");
module.exports = {
  getRevenueByDay: () => {
    let date = new Date();
    let thisMonth = date.getMonth();
    let month = thisMonth + 1;

    let year = date.getFullYear();

    return new Promise(async (resolve, reject) => {
      try {
        db.order
          .aggregate([
            {
              $unwind: "$orders",
            },
            {
              $unwind: "$orders.productsDetails",
            },
            {
              $match: {
                "orders.createdAt": {
                  $gt: new Date(`${year}-${month}-01`),
                  $lt: new Date(`${year}-${month}-31`),
                },
              },
            },
            {
              $match: { "orders.productsDetails.orderStatus": "Delivered" },
            },
            {
              $group: {
                _id: { $dayOfMonth: "$orders.createdAt" },
                total: { $sum: "$orders.totalPrice" },
                orders: { $sum: "$orders.totalQuantity" },
                count: { $sum: 1 },
              },
            },
            {
              $sort: {
                "orders.createdAt": 1,
              },
            },
          ])
          .then((data) => {
            resolve({ data: data });
          });
      } catch (err) {
        console.log(err);
        reject({ error: "Unauthorized Action" });
      }
    });
  },

  monthWiseSales: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let data = [];
        for (let i = 0; i < 12; i++) {
          await db.order
            .aggregate([
              {
                $unwind: "$orders",
              },
              {
                $unwind: "$orders.productDetails",
              },
              {
                $match: { "orders.productDetails.Delivery": "Delivered" },
              },
              {
                $match: {
                  $expr: {
                    $eq: [
                      {
                        $month: "$orders.createdAt",
                      },
                      i + 1,
                    ],
                  },
                },
              },
              {
                $group: {
                  _id: null,
                  total: { $sum: "$orders.totalPrice" },
                  orders: { $sum: "$orders.quantity" },
                  count: { $sum: 1 },
                },
              },
            ])
            .then((monthlyData) => {
              data[i + 1] = monthlyData[0];
            })
            .catch((err) => reject({ error: "Unauthorized Action" }));
        }
        for (i = 0; i < 12; i++) {
          if (data[i + 1] == undefined) {
            data[i + 1] = {
              total: 0,
              order: 0,
              count: 0,
            };
          } else {
            data[i];
          }
        }
        resolve({ status: true, data: data });
      } catch (error) {
        reject({ error: "Unauthorized Action" });
      }
    });
  },
};
