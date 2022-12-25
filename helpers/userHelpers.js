const db = require("../Model/connection");

const bcrypt = require("bcrypt");
const ObjectId = require("objectid");
const { response } = require("../app");

module.exports = {
  //User Signup

  doSignup: (userData) => {
    return new Promise((resolve, reject) => {
      try {
        db.user
          .find({
            $or: [
              { email: userData.email },
              { phoneNumber: userData.phoneNumber },
            ],
          })
          .then(async (email) => {
            let response = {};
            if (email.length == 0) {
              try {
                userData.password = await bcrypt.hash(userData.password, 10);
                let data = db.user(userData);
                data.save();
                response.status = true;
                response.user = data;
                resolve(response);
              } catch (error) {
                console.log(error);
                reject({ error: "Unauthorized Action" });
              }
            } else {
              response.status = false;
              resolve(response);
            }
          });
      } catch (error) {
        reject({ error: "Unauthorized Action" });
      }
    });
  },

  //User Login

  doLogin: (loginData) => {
    return new Promise(async (resolve, reject) => {
      try {
        let response = {};
        let user = await db.user.findOne({ email: loginData.email });
        if (user) {
          if (user.status) {
            bcrypt
              .compare(loginData.password, user.password)
              .then((loginTrue) => {
                if (loginTrue) {
                  response.status = true;
                  response.user = user;
                  resolve(response);
                } else {
                  response.status = false;
                  response.user = user;
                  resolve(response);
                }
              });
          } else {
            response.user = user;
            resolve(response);
          }
        } else {
          response.status = false;
          resolve(response);
        }
      } catch (error) {
        reject({ error: "Unauthorized Action" });
        console.log(error);
      }
    });
  },

  //Get All User

  getAllusers: (page, limit) => {
    return new Promise(async (resolve, reject) => {
      try {
        var docCount;
        let user = await db.user
          .find({})
          .countDocuments()
          .then((Documents) => {
            docCount = Math.ceil(Documents / limit);
            return db.user
              .find()
              .skip((page - 1) * limit)
              .limit(limit);
          });

        resolve({ user, docCount });
      } catch (error) {
        console.log(error);
        reject({ error: "Unauthorized Action" });
      }
    });
  },

  //Block User

  blockUser: (userId) => {
    return new Promise((resolve, reject) => {
      try {
        db.user
          .updateOne(
            { _id: userId },
            {
              $set: {
                status: false,
              },
            }
          )
          .then(() => {
            resolve();
          });
      } catch (error) {
        console.log(error);
        reject({ error: "Unauthorized Action" });
      }
    });
  },

  //Unblock User

  unblockUser: (userId) => {
    return new Promise((resolve, reject) => {
      try {
        db.user
          .updateOne(
            { _id: userId },
            {
              $set: {
                status: true,
              },
            }
          )
          .then(() => {
            resolve();
          });
      } catch (error) {
        console.log(error);
        reject({ error: "Unauthorized Action" });
      }
    });
  },

  updateProfile: (data, userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let user = await db.user.findOne({ _id: ObjectId(userId) });
        if (user) {
          bcrypt
            .compare(data.currentPassword, user.password)
            .then(async (loginTrue) => {
              if (loginTrue) {
                data.currentPassword = await bcrypt.hash(
                  data.currentPassword,
                  10
                );
                db.user
                  .updateOne(
                    { _id: userId },
                    {
                      $set: {
                        fName: data.fName,
                        lName: data.lName,
                        email: data.email,
                        password: data.confirmPasswordPro,
                      },
                    }
                  )
                  .then(() => {
                    resolve({ status: true });
                  })
                  .catch((err) => reject({ error: "Unauthorized Action" }));
              } else {
                resolve({ status: false });
              }
            });
        }
      } catch (error) {
        reject({ error: "Unauthorized Action" });
      }
    });
  },

  addToWishlist: (proId, userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        proObj = {
          item: proId,
          status: true,
        };

        let userWishlist = await db.wishlist.findOne({ user: userId });

        if (userWishlist) {
          let prodExist = userWishlist.wishlistProducts.findIndex(
            (wishlistProducts) => wishlistProducts.item == proId
          );
          if (prodExist == -1) {
            db.wishlist
              .updateOne(
                { user: userId },
                {
                  $push: {
                    wishlistProducts: proObj,
                  },
                }
              )
              .then((e) => {
                resolve({ status: true });
              });
          } else {
            resolve({ status: true });
          }
        } else {
          let wishlistObj = {
            user: userId,
            wishlistProducts: [proObj],
          };
          db.wishlist(wishlistObj)
            .save()
            .then(() => {
              resolve();
            })
            .catch((err) => reject({ error: "Unauthorized Action" }));
        }
      } catch (error) {
        reject({ error: "Unauthorized Action" });
      }
    });
  },
  getwishlistCound: (user) => {
    return new Promise((resolve, reject) => {
      try {
        let wishlistCount = 0
        db.wishlist.find({ user: user }).then((wish) => {
           wishlistCound = wish[0]?.wishlistProducts.length;
          resolve(wishlistCound);
        });
      } catch (error) {
        reject({ error: "Unauthorized Action" });
      }
    });
  },

  getwishlistProducts: (user) => {
    return new Promise((resolve, reject) => {
      try {
        db.wishlist
          .aggregate([
            {
              $match: { user: user },
            },
            {
              $unwind: "$wishlistProducts",
            },
            {
              $project: {
                item: "$wishlistProducts.item",
                status: "$wishlistProducts.status",
              },
            },
            {
              $lookup: {
                from: "products",
                localField: "item",
                foreignField: "_id",
                as: "wishlistItems",
              },
            },
            {
              $project: {
                item: 1,
                status: 1,
                Product: { $arrayElemAt: ["$wishlistItems", 0] },
              },
            },
          ])
          .then((wishlistItems) => {
            resolve(wishlistItems);
          })
          .catch((err) => reject({ error: "Unauthorized Action" }));
      } catch (error) {
        reject({ error: "Unauthorized Action" });
      }
    });
  },

  // Delete Wishlist Product //

  deleteWishlistProduct: (data, user) => {
    return new Promise((resolve, reject) => {
      try {
        const id = data.product;
        db.wishlist
          .updateOne(
            { user: user },
            {
              $pull: {
                wishlistProducts: { item: id },
              },
            }
          )
          .then((e) => {
           
            console.log(e);
            resolve({ removeProduct: true });
          })
          
      } catch (error) {
        reject({ error: "Unauthorized Action" });
      }
      
    });
  },
};
