var express = require("express");
const adminController = require("../Controller/adminController");
var router = express.Router();

/* GET Admin listing. */

// Admin Index Router//

router.get("/", adminController.getAdminpanel);

// Get Admin Login Router//

router.get("/admin_login", adminController.getAdminlogin);

// Post Admin Login Router//

router.post("/admin_login", adminController.postAdminlogin);

// Get Porduct  Router//

router.get("/products", adminController.getProducts);

// Get Add Product Router//

router.get("/products/add_product", adminController.getAddproduct);

// Post Add Product Router//

router.post("/products/add_product", adminController.postAddproduct);

// Admin Logout Router//

router.get('/admin_logout',adminController.getAdminlogout);

// Delete Product Router//

router.get('/products/delete_product/:id',adminController.deleteProduct);

// Edit Product Router//

router.get('/products/edit_product/:id',adminController.editProduct);

// Update Product Router//

router.post('/products/edit_product/:id',adminController.updateProduct);

// Get All Users Router//

router.get('/users',adminController.getAllusers);

// Blocke Users Router//

router.get('/users/block_user/:id',adminController.blockUser);

// UnBlock Router//

router.get('/users/unblock_user/:id',adminController.unblockUser);

// Get Category Router//

router.get('/category',adminController.getCategory);

// Add Category Router//

router.post('/category/add_categories',adminController.addCategory);

// Delete Category Router//

router.get('/category/delete_categories/:id',adminController.deleteCategory);

// Edit Category Router//

router.get('/category/edit_categories/:id',adminController.editCategory);

// Edit Category Router//

router.post('/category/edit_categories/:id',adminController.updateCategory);


module.exports = router;
