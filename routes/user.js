var express = require("express");
var router = express.Router();
const userController = require("../Controller/userController");

/* GET home page. */

// Index Page Router //

router.get("/", userController.indexPage);

// Get User SignUp Page Router //

router.get("/user_registration", userController.getUsersignup);

// Post User SignUp Router //

router.post("/user_registration", userController.postUsersignup);

// Get User Login  Router //

router.get("/user_signin", userController.getUsersiginin);

// Post User Login Router //

router.post("/user_signin", userController.postUsersignin);

// Get User Logout Router //

router.get("/user_logout", userController.getUserlogout);

// Get Otp Login Page Router //

router.get('/otp_page',userController.getOtpPage);

// Get Otp Sent Router //

router.get('/otp_login',userController.getOtplogin);

// Get Otp Verify Router //

router.get('/otp_verify',userController.getOtpverify);

// Get Product Page Router //

router.get('/view_product/:id',userController.getProductPage)



module.exports = router;
