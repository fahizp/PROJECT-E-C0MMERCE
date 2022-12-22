const { parse } = require("dotenv");
const ObjectId = require("objectid");
const { response } = require("../app");
const { user } = require("../Model/connection");
const db = require("../Model/connection");
module.exports = {
  addCoupon: (data) => {
    return new Promise(async (resolve, reject) => {
      try {
        discountAmount = data.amount == "" ? 0 : parseInt(data.amount);
        discountPercentage =
          data.percentage == "" ? 0 : parseInt(data.percentage);
        cappedAmount =
          data?.cappedAmount == "" ? 0 : parseInt(data?.cappedAmount);
        let couponObj = {
          coupon: data.coupon,
          discountType: data.discountType,
          amount: discountAmount,
          amountValidity: data.amountValidity,
          cappedAmount: cappedAmount,
          percentage: discountPercentage,
          validityTill: data.validity,

          description: data.description,
          usageValidity: data.redeemTime,
        };
        console.log(couponObj);
        let coupon = await db.coupon(couponObj);

        await coupon.save();
        resolve({ status: true });
      } catch (error) {
        console.log(error);
      }
    });
  },

  verifyCoupen: (data, user) => {
    let coupon = data.coupon;
    return new Promise((resolve, reject) => {
      try {
        db.coupon.findOne({ coupon: coupon }).then(async (response) => {
          console.log("res=>", response);
          if (response) {
            let couponExist = await db.user.findOne({
              _id: user,
              "coupon.name": coupon,
            });
            if (!couponExist) {
              let couponData = {
                name: coupon,
                purchased: false,
              };
              db.user
                .updateOne(
                  { _id: user },
                  {
                    $push: {
                      coupon: couponData,
                    },
                  }
                )
                .then((e) => {
                  console.log(e);
                  resolve({ status: true });
                });
            } else {
              resolve({ coupon: true });
            }
          } else {
            resolve({ status: false });
          }
        });
      } catch (err) {
        console.log(err);
      }
    });
  },
  couponChecked: (data, userId) => {
    return new Promise(async (resolve, reject) => {
      let purchased = await db.user.aggregate([
        {
          $match: { _id: userId },
        },
        {
          $unwind: "$coupon",
        },
        {
          $match: {
            $and: [
              {
                "coupon.name": data,
                "coupon.purchased": false,
              },
            ],
          },
        },
      ]);
      console.log(purchased.length);
      if (!purchased.length) {
        console.log("true");
        resolve({ purchased: true });
      } else {
        console.log("false");
        resolve({ purchased: false });
      }
    });
  },

  applyCoupon: (data, user, total) => {
    return new Promise(async (resolve, reject) => {
      try {
        let couponData = await db.coupon.findOne({ coupon: data });
        console.log(couponData);
        if (couponData) {
          if ( new Date(couponData.validityTill) - new Date() > 0 && couponData.usageValidity > 0 ) {
            let amountValid = couponData.amountValidity.split("-");
            if (couponData.discountType == "Amount") {
              if (total >= amountValid[0] && total <= amountValid[1]) {
                let discountAmount = Math.floor(couponData.amount);
                let finalAmount = Math.floor(total - couponData.amount);
                resolve({ finalAmount, discountAmount });
              } else {
                resolve({ couponNotApplicable: true, amountValid })
              }
            } else {
              if (total >= amountValid[0] && total <= amountValid[1]) {
                let cappedAmount = couponData?.cappedAmount
                let discountAmount= await ((total * couponData.percentage) / 100)
                if (discountAmount>cappedAmount) {
                  discountAmount=cappedAmount
                  let finalAmount=Math.floor(total-discountAmount)
                  resolve({ finalAmount, discountAmount })
                } else {
                  let finalAmount=Math.floor(total-discountAmount)
                  discountAmount = Math.floor(discountAmount)
                  resolve({ finalAmount, discountAmount })
                }
              } else {
                 resolve({ couponNotApplicable: true, amountValid })
              }

            }
          } else {
            resolve({ couponExpired: true });
          }
        }
      } catch (error) {
        console.error(error);
      }
    });
  },

  deleteCoupon:(copId)=>{
    return new Promise(async (resolve, reject) => {
      try {
        await db.coupon.deleteOne({ _id: copId }).then((e)=>{
          console.log(e);
        })
        resolve();
      } catch (error) {
        console.log(error);
      }
    });
  }
};
