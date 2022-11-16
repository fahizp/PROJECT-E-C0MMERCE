const db = require("../Model/connection");

const bcrypt = require("bcrypt");

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

  getAllusers:()=>{
    return new Promise(async(resolve, reject) => {
        try {
            let user=await db.user.find({})
            resolve(user)
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
  }
};
