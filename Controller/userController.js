const db = require("../Model/connection");

const productHelpers = require("../helpers/productHelpers");
const adminHelpers = require("../helpers/adminHelpers");
const userHelpers = require("../helpers/userHelpers");
const session = require("express-session");
const { response } = require("../app");
const otp = require("../helpers/otpHelpers");
const client = require("twilio")(otp.accoundSid, otp.authToken);

module.exports = {
  //LandinPage

  indexPage: function (req, res, next) {
    let user = req.session.user;
    console.log(req.session);
    productHelpers.getAllproduct().then((product)=>{
        res.render("index", { user,product});
    })
    
  },


  //User SignUp

  getUsersignup: (req, res) => {
    if (req.session.userIn) {
      res.redirect("/");
    } else {
      res.render("user/user_registration",{nav:true});
    }
  },


//User SignUp

  postUsersignup: (req, res) => {
    userHelpers.doSignup(req.body).then((response) => {
      if (response.status) {
        req.session.user = response.user;
        req.session.userIn = true;
        res.send({value:"Success"})
      } else {
        req.session.userIn = false;
        res.send({value:"error"})
      }
    });
  },


  //User Login

  getUsersiginin: (req, res) => {
    if (req.session.userIn) {
      res.redirect("/");
    } else {
      res.render("user/user_signin",{nav:true});
    }
  },


//User Login Post

  postUsersignin: (req, res) => {
    userHelpers.doLogin(req.body).then((response) => {
      if (response.status) {
        req.session.user = response.user;
        req.session.userIn = true;
        res.send({value:"Successlogin"})
      }else if(!response.user.status){
        res.send({value:"block"})
      }      
      else {
        // res.session.userIn = false;
        res.send({value:"errorlogin"})
      }
    });
  },


// User Logout

  getUserlogout: (req, res) => {
    req.session.user = null;
    req.session.userIn = false;
    res.clearCookie();
    res.redirect("/user_signin");
  },


  //Otp Login

  getOtpPage: (req, res) => {
    res.render("user/user_otpLogin",{nav:true});
  },


// Otp Send

  getOtplogin: (req, res) => {   
    client
    .verify
    .services(otp.serviceId)
    .verifications
    .create({
        to:`+${req.query.phoneNumber}`,
        channel:req.query.channel,
    })
    .then((data)=>{
        res.status(200).send(data)
        console.log(data);
    })
  },


//Otp Verify

  getOtpverify:(req,res)=>{
    client
    .verify
    .services(otp.serviceId)
    .verificationChecks
    .create({
      to: `+${req.query.phoneNumber}`,
      code: req.query.code
    })
    .then(async (data) => {
      if (data.valid) {
        let Number = data.to.slice(3);
        let userData = await db.user.findOne({ number: Number });
        req.session.user = userData;
        if(userData.status){
            res.send({ value: 'success' })
        }else{
            res.send({ value: 'block' }) 
        }      
      } else {
        res.send({ value: 'failed' })
      }
    })
},


//Product Page

getProductPage:(req,res)=>{
   let proId= req.params.id
    productHelpers.getProduct(proId).then((product)=>{
        res.render('user/product',{product})
    })
   
}
};
