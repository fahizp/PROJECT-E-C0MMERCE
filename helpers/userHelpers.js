const db = require("../Model/connection");

const bcrypt = require("bcrypt");
const ObjectId = require("objectid");
const { response } = require("../app");

module.exports = {


//User Signup

  doSignup: (userData) => {
    return new Promise((resolve, reject) => {
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
            }
          } else {
            response.status = false;
            resolve(response);
          }
        });
    });
  },


//User Login

  doLogin: (loginData) => {
    return new Promise(async (resolve, reject) => {
      try {
        let response = {};
        let user = await db.user.findOne({ email: loginData.email });
        if (user) {
            if(user.status){
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
        }else{
            response.user = user;
            resolve(response)
        }
        } else {
          response.status = false;
          resolve(response);
        }
      } catch (error) {
        console.log(error);
      }
    });
  },


//Get All User 

  getAllusers:(page,limit)=>{
    return new Promise(async(resolve, reject) => {
        try {
            var docCount ;
            let user=await db.user.find({}).countDocuments().then((Documents)=>{
              
              docCount=Math.ceil(Documents/limit);
              return db.user.find().skip((page-1)*limit).limit(limit)
            })    
            
            resolve({user,docCount});
        } catch (error) {
            console.log(error);
        }
       
    })
  },

  //Block User

  blockUser:(userId)=>{
    return new Promise((resolve, reject) => {
        try {
            db.user.updateOne({_id:userId},{
                $set:{
                    status:false,
                }
            }).then(()=>{
                resolve()
            })           
        } catch (error) {
            console.log(error);
        }
    })
  },

  
  //Unblock User

  unblockUser:(userId)=>{
    return new Promise((resolve, reject) => {
        try {
            db.user.updateOne({_id:userId},{
                $set:{
                    status:true,
                }               
            }).then(()=>{
                resolve()
            })           
        } catch (error) {
            console.log(error);
        }
    })
  },

  updateProfile:(data,userId)=>{
    return new Promise(async(resolve, reject) => {
      let user=await db.user.findOne({_id:ObjectId(userId)})
      if (user) {
        bcrypt.compare(data.currentPassword, user.password).then(async(loginTrue)=>{
          console.log(loginTrue);
           if (loginTrue) {
            data.currentPassword=await bcrypt.hash(data.currentPassword,10)
            console.log("htee");
            db.user.updateOne({ _id: userId }, {
              $set: {
                  fName: data.fName,
                  lName: data.lName,
                  email: data.email,
                  password: data.confirmPasswordPro
              }
          }).then(() => {
              resolve({ status: true })
          })
           } else {
            resolve({status:false})
           }
        })
      }
    })
  },

  addToWishlist:(proId,userId)=>{
    return new Promise(async(resolve, reject) => {
      proObj = {
        item: proId,
        status:true,
      };

      let userWishlist = await db.wishlist.findOne({ user: userId });
     
      if (userWishlist) {
        console.log("alredt");
        let prodExist = userWishlist.wishlistProducts.findIndex(
          (wishlistProducts) => wishlistProducts.item == proId
        );
        if (prodExist== -1) {
          db.wishlist.updateOne({user:userId },{
            $push:{
              wishlistProducts: proObj
            }
          }).then((e)=>{
            console.log(e);
           resolve({status:true})
          })
        }else{
          console.error("sorryh");
          resolve({status:true})
        }
        
      } else {
        console.log("alt");
        let wishlistObj = {
          user: userId,
          wishlistProducts: [proObj],
        };
        db.wishlist(wishlistObj)
          .save()
          .then(() => {
            resolve();
          })
          .catch((err) => console.log(err));
      }
      

    })
  },
  getwishlistCound:(user)=>{
    return new Promise((resolve, reject) => {
      db.wishlist.find({user:user}).then((wish)=>{
       let wishlistCound=wish[0]?.wishlistProducts.length
       resolve(wishlistCound)
      })
    })
  },

  getwishlistProducts:(user)=>{
    return new Promise((resolve, reject) => {
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
              status:"$wishlistProducts.status",
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
              status:1,
              Product: { $arrayElemAt: ["$wishlistItems", 0] },
            },
          },
        ])
        .then((wishlistItems) => {
          console.log("asdfghj",wishlistItems);
          resolve(wishlistItems);
        })
        .catch((err) => console.log(err));
    });
  },

  // Delete Wishlist Product //

  deleteWishlistProduct: (data, user) => {
    return new Promise((resolve, reject) => {
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
          resolve({ removeProduct: true });
        })
        .catch((err) => console.log(err));
    });
  },
};
