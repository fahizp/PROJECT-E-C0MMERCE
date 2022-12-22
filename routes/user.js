var express = require("express");
var router = express.Router();
const userController = require("../Controller/userController");
const auth = require('../Controller/auth')

/* GET home page. */

// Index Page Router //

router.get("/",userController.indexPage);

// Get User SignUp Page Router //

router.get("/user_registration",auth.mustLogoutUser, userController.getUsersignup);

// Post User SignUp Router //

router.post("/user_registration", userController.postUsersignup);

// Get User Login  Router //

router.get("/user_signin",auth.mustLogoutUser, userController.getUsersiginin);

// Post User Login Router //

router.post("/user_signin", userController.postUsersignin);

// Get User Logout Router //

router.get("/user_logout", userController.getUserlogout);

// Get Otp Login Page Router //

router.get('/otp_page',auth.mustLogoutUser,userController.getOtpPage);

// Get Otp Sent Router //

router.get('/otp_login',userController.getOtplogin);

// Get Otp Verify Router //

router.get('/otp_verify',userController.getOtpverify);

// Get Product Page Router //

router.get('/view_product/:id',userController.getProductPage)

//Get Cart Page //

router.get('/cart',auth.verifyUser,userController.getCartpage)

//Add To Cart //

router.get('/addtocart/:id',auth.verifyUserAPI ,userController.getAdtoCart)

// Change Product Quantity // 

router.put('/change-product-quantity',auth.verifyUserAPI ,userController.changeProductQuantity)

// Delete Cart Product //

router.delete('/deleteCartItems',auth.verifyUserAPI ,userController.deleteCartProduct)

// Check Out Page //

router.get('/proceedToCheckOut',auth.verifyUser,userController.checkOut)

// Place Order Page //

router.post('/place-order',userController.placeOrder)

// Order History Page //

// Wishlist Page //

router.get('/wishlist',auth.verifyUser,userController.wishlist)

// Auto Fill Address //

router.get('/autofill-address/:id',auth.verifyUserAPI ,userController.autofill)

// Cancel Order //

router.post('/orders',auth.verifyUserAPI ,userController.cancelOrder)

// Account Page //
router.get('/my-account/orders',auth.verifyUserAPI ,userController.orders)

router.get('/my-account',auth.verifyUser,userController.account)

router.get('/my-account/address',auth.verifyUserAPI ,userController.addressGet)

//

router.post('/verify-payment',auth.verifyUserAPI ,userController.verifypayment)

//


router.post('/create-order',auth.verifyUserAPI ,userController.paypalOrder)

router.get('/paypal-success',auth.verifyUserAPI ,userController.paypalSuccess)

router.get('/check-cart-quantity/:id',auth.verifyUserAPI ,userController.checkCartQuantity)

router.get('/shop',userController.shop)

router.delete( '/my-account/address/delete-address/:id',auth.verifyUserAPI ,userController.deleteAddress)

router.get('/my-account/orders/:id',auth.verifyUserAPI ,userController.singleOrder)

router.get('/order-invoice-products',auth.verifyUserAPI ,userController.orderInvoice)

router.put('/returnOrder',auth.verifyUserAPI ,userController.returnOrder)

router.put('/my-account/address/add_address',auth.verifyUserAPI ,userController.addAddress)

router.get('/my-account/profile',auth.verifyUserAPI ,userController.profile)

router.put('/accounts/profile/updateProfile',auth.verifyUserAPI ,userController.updateProfile)

router.put('/accounts/address/:id',auth.verifyUserAPI ,userController.editAddress)

router.get('/blog',userController.getBlogPage)

router.get('/contact',userController.getContactPage)

router.post('/proceedToCheckOut/coupon_verify',auth.verifyUserAPI ,userController.verifyCoupon)

router.post('/proceedToCheckOut/verify_coupon_checked',auth.verifyUserAPI ,userController.couponChecked)

router.post( '/proceedToCheckOut/apply_coupon',auth.verifyUserAPI ,userController.applyCoupon)

router.get('/addtoWishlist/:id',auth.verifyUserAPI ,userController.addToWishlist)

router.delete('/deleteWishlistItems',auth.verifyUserAPI ,userController.deleteWishlistProduct)
router.get('/getProductData',userController.getProductData)




module.exports = router;
