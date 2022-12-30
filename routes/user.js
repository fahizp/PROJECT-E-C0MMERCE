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

// Account Dashboard //

router.get('/my-account',auth.verifyUser,userController.account)

// Address Get //

router.get('/my-account/address',auth.verifyUserAPI ,userController.addressGet)

// Verify Payment //

router.post('/verify-payment',auth.verifyUserAPI ,userController.verifypayment)

// Papal Order post //


router.post('/create-order',auth.verifyUserAPI ,userController.paypalOrder)

// Papal Success  //

router.get('/paypal-success',auth.verifyUserAPI ,userController.paypalSuccess)

// Check Cart Quantity  //

router.get('/check-cart-quantity/:id',auth.verifyUserAPI ,userController.checkCartQuantity)
 //

router.get('/shop',userController.shop)

// Delete Address //

router.delete( '/my-account/address/delete-address/:id',auth.verifyUserAPI ,userController.deleteAddress)

// Single Order //

router.get('/my-account/orders/:id',auth.verifyUserAPI ,userController.singleOrder)

// Order Invoice //

router.get('/order-invoice-products',auth.verifyUserAPI ,userController.orderInvoice)

// Retrun Order //

router.put('/returnOrder',auth.verifyUserAPI ,userController.returnOrder)

// Add Address //

router.put('/my-account/address/add_address',auth.verifyUserAPI ,userController.addAddress)

// Profile //

router.get('/my-account/profile',auth.verifyUserAPI ,userController.profile)

// Update Profile //

router.put('/accounts/profile/updateProfile',auth.verifyUserAPI ,userController.updateProfile)

// Edit Address //

router.put('/accounts/address/:id',auth.verifyUserAPI ,userController.editAddress)

// Get Blog Page //

router.get('/blog',userController.getBlogPage)

// Contact //

router.get('/contact',userController.getContactPage)

// Coupon Verify //

router.post('/proceedToCheckOut/coupon_verify',auth.verifyUserAPI ,userController.verifyCoupon)

// Coupon Checked //

router.post('/proceedToCheckOut/verify_coupon_checked',auth.verifyUserAPI ,userController.couponChecked)

// Apply Coupon //

router.post( '/proceedToCheckOut/apply_coupon',auth.verifyUserAPI ,userController.applyCoupon)

// Add To Wishlist //

router.get('/addtoWishlist/:id',auth.verifyUserAPI ,userController.addToWishlist)

// Delete Wishlist Product //

router.delete('/deleteWishlistItems',auth.verifyUserAPI ,userController.deleteWishlistProduct)

// Get Product Data  //

router.get('/getProductData',userController.getProductData)

// get Banner Catergoty Shop //

router.get('/shop_banner',userController.getBannerShop)




module.exports = router;
