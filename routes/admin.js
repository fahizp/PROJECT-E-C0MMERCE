var express = require("express");
const adminController = require("../Controller/adminController");
const auth=require('../Controller/auth')
var router = express.Router();

/* GET Admin listing. */

// Admin Index Router//

router.get("/", adminController.getAdminpanel);

// Get Admin Login Router//

router.get("/admin_login",auth.mustLogoutAdmin, adminController.getAdminlogin);

// Post Admin Login Router//

router.post("/admin_login", adminController.postAdminlogin);

// Get Porduct  Router//

router.get("/products",auth.verifyAdminAPI, adminController.getProducts);

// Get Add Product Router//

router.get("/products/add_product",auth.verifyAdminAPI, adminController.getAddproduct);

// Post Add Product Router//

router.post("/products/add_product", adminController.postAddproduct);

// Admin Logout Router//

router.get('/admin_logout',adminController.getAdminlogout);

// Delete Product Router//

router.get('/products/delete_product/:id',auth.verifyAdminAPI,adminController.deleteProduct);

// Edit Product Router//

router.get('/products/edit_product/:id',auth.verifyAdminAPI,adminController.editProduct);

// Update Product Router//

router.post('/products/edit_product/:id',adminController.updateProduct);

// Get All Users Router//

router.get('/users',auth.verifyAdmin,auth.verifyAdminAPI,adminController.getAllusers);

// Blocke Users Router//

router.get('/users/block_user/:id',auth.verifyAdminAPI,adminController.blockUser);

// UnBlock Router//

router.get('/users/unblock_user/:id',auth.verifyAdminAPI,adminController.unblockUser);

// Get Category Router//

router.get('/category',auth.verifyAdmin,adminController.getCategory);

// Add Category Router//

router.post('/category/add_categories',adminController.addCategory);

// Delete Category Router//

router.get('/category/delete_categories/:id',auth.verifyAdminAPI,adminController.deleteCategory);

// Edit Category Router//

router.get('/category/edit_categories/:id',auth.verifyAdminAPI,adminController.editCategory);

// Edit Category Router//

router.post('/category/edit_categories/:id',auth.verifyAdminAPI,adminController.updateCategory);

// Get Admin Orders Router //

router.get('/order_management',auth.verifyAdmin,adminController.getAdminOrders)

// Get Admin Order Detailes Router //

router.get('/order_management/details/:id',auth.verifyAdminAPI,adminController.getAdminOrdersDetailes)


router.put('/updateOrder',auth.verifyAdminAPI,adminController.updateOrder)

router.get('/chartGraph',auth.verifyAdmin,adminController.chartGraph)

router.get('/copoun/add_coupon',auth.verifyAdminAPI,adminController.addCoupon)

router.get('/coupenManagement/generate_coupon',auth.verifyAdminAPI,adminController.getCouponCode)

router.post('/couponManagement/add_coupon',auth.verifyAdminAPI,adminController.postAddCoupon)

router.get("/copoun",auth.verifyAdmin, adminController.getCoupon);

// router.delete('/copoun/delete_coupon/:id',adminController.deleteCoupon)

router.delete('/coupon/delete_coupon/:id',auth.verifyAdminAPI,adminController.deleteCoupon);

router.get('/salesreport',auth.verifyAdmin,adminController.getSalesReportPage)

router.get('/banner',auth.verifyAdmin,adminController.bannerManagement)

router.get('/banner/add_banner',auth.verifyAdmin,adminController.addBannerGet)

router.post('/banner/add_banner',auth.verifyAdmin,adminController.addBannerPost)


router.get('/banner/disable/:id',auth.verifyAdmin,adminController.disableBanner)

router.get('/banner/enable/:id',auth.verifyAdmin,adminController.enableBanner)


module.exports = router;
