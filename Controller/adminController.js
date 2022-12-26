const db = require("../Model/connection");
const fileupload = require("express-fileupload");
const productHelpers = require("../helpers/productHelpers");
const adminHelpers = require("../helpers/adminHelpers");
const session = require("express-session");
const userHelpers = require("../helpers/userHelpers");
const orderHelpers = require("../helpers/orderHelpers");
const { admin } = require("../Model/connection");
const chartHelpers = require("../helpers/chartHelpers");
const couponHelpers = require("../helpers/couponHelpers");
const bannerHelpers = require("../helpers/bannerHelpers");
const reportHelpers = require("../helpers/reportHelpers");
const voucher_codes = require("voucher-code-generator");
const { response } = require("../app");
// const XLSX = require("xlsx");

module.exports = {
  //Admin IndexPage

  getAdminpanel: async function (req, res, next) {
    try {
      if (req.session.adminIn) {
        let products = await db.products.find({});
        let category = await db.categories.find({});
        reportHelpers
          .getrevenuebyMonth()
          .then((price) => {
            reportHelpers
              .getorderCount()
              .then(async (count) => {
                let year = new Date().getFullYear();
                let month = new Date().getMonth() + 1;
                let daily = await reportHelpers.getRevenuebyDay(month, year);
                let yearlyData = await reportHelpers.getRevenuebyYear(year);
                let priceData = price.arr[new Date().getMonth() + 1];
                res.render("admin-index", {
                  yearlyData,
                  daily,
                  price,
                  products,
                  priceData,
                  count,
                  category,
                  layout: "admin-layout",
                });
              })
              .catch((err) => {
                res.render("user/500Page");
                console.log(err);
              });
          })
          .catch((err) => {
            res.render("user/500Page");
            console.log(err);
          });
      } else {
        res.redirect("/admin_panel/admin_login");
      }
    } catch (error) {
      console.log(error);
      res.render("user/500Page");
    }
  },

  //Admin Login Management

  // Admin Login Page

  getAdminlogin: (req, res) => {
    try {
      if (req.session.adminIn) {
        res.redirect("/admin_panel");
      } else {
        res.render("admin/admin-login", {
          layout: "admin-layout",
          admin: true,
        });
      }
    } catch (error) {
      console.log(error);
      res.render("user/500Page");
    }
  },

  // Admin Login Post

  postAdminlogin: (req, res) => {
    try {
      adminHelpers
        .doAdminlogin(req.body)
        .then((response) => {
          if (response.status) {
            req.session.admin = response.admin._id;
            req.session.adminIn = true;
            res.redirect("/admin_panel");
          } else {
            res.redirect("/admin_panel/admin_login");
          }
        })
        .catch((err) => {
          res.render("user/500Page");
          console.log(err);
        });
    } catch (error) {
      res.render("user/500Page");
    }
  },

  // Admin Logout

  getAdminlogout: (req, res) => {
    try {
      req.session.admin = null;
      req.session.adminIn = false;
      res.clearCookie();
      res.redirect("/admin_panel/admin_login");
    } catch (error) {
      console.log(error);
      res.render("user/500Page");
    }
  },

  /////product Management//////

  // Get Add Product

  getAddproduct: (req, res) => {
    try {
      productHelpers
        .getAllcategory()
        .then((category) => {
          res.render("admin/add-product", {
            layout: "admin-layout",
            category,
          });
        })
        .catch((err) => {
          res.render("user/500Page");
          console.log(err);
        });
    } catch (error) {
      res.render("user/500Page");
    }
  },

  // Get Product

  getProducts: (req, res) => {
    try {
      productHelpers
        .getAllproduct(req.query.page, req.query.limit)
        .then((response) => {
          res.render("admin/productManagement", {
            layout: "admin-layout",
            product: response.product,
            docCount: response.docCount,
            currentPage: req.query.page,
          });
        })
        .catch((err) => {
          res.render("user/500Page");
          console.log(err);
        });
    } catch (error) {
      res.render("user/500Page");
    }
  },

  // Post Add Product

  postAddproduct: (req, res) => {
    try {
      productHelpers
        .addProduct(req.body)
        .then((insertedId) => {
          let name = insertedId;
          req.files?.image?.forEach((element, index) => {
            element.mv(
              "./public/productImages/" + name + index + ".jpg",
              (err, done) => {
                if (!err) {
                  console.log("product add");
                } else {
                  console.log(err);
                }
              }
            );
          });
          res.redirect("/admin_panel/products/add_product");
        })
        .catch((err) => {
          res.render("user/500Page");
          console.log(err);
        });
    } catch (error) {
      res.render("user/500Page");
    }
  },

  // Delete Product

  deleteProduct: (req, res) => {
    try {
      let proId = req.params.id;
      productHelpers
        .deleteProduct(proId)
        .then(() => {
          res.redirect("/admin_panel/products");
        })
        .catch((err) => {
          res.render("user/500Page");
          console.log(err);
        });
    } catch (error) {
      res.render("user/500Page");
    }
  },

  // Edit Product

  editProduct: async (req, res) => {
    try {
      let proId = req.params.id;
      let category = await productHelpers.getAllcategory();
      productHelpers
        .getProduct(proId)
        .then((product) => {
          res.render("admin/edit-product", {
            layout: "admin-layout",
            product,
            category,
          });
        })
        .catch((err) => {
          res.render("user/500Page");
          console.log(err);
        });
    } catch (error) {
      res.render("user/500Page");
    }
  },

  // Update Product

  updateProduct: (req, res) => {
    try {
      let proId = req.params.id;
      let body = req.body;
      productHelpers
        .updateProduct(proId, body)
        .then(() => {
          req?.files?.image1?.mv("./public/productImages/" + proId + "0.jpg");
          req?.files?.image2?.mv("./public/productImages/" + proId + "1.jpg");
          req?.files?.image3?.mv("./public/productImages/" + proId + "2.jpg");
          req?.files?.image4?.mv("./public/productImages/" + proId + "3.jpg");
          res.redirect("/admin_panel/products");
        })
        .catch((err) => {
          res.render("user/500Page");
          console.log(err);
        });
    } catch (error) {
      res.render("user/500Page");
    }
  },

  /////user Management/////

  // Get All Users

  getAllusers: (req, res) => {
    try {
      userHelpers
        .getAllusers(req.query.page, req.query.limit)
        .then((response) => {
          res.render("admin/userManagement", {
            layout: "admin-layout",
            users: response.user,
            docCount: response.docCount,
            currentPage: req.query.page,
          });
        })
        .catch((err) => {
          res.render("user/500Page");
          console.log(err);
        });
    } catch (error) {
      res.render("user/500Page");
    }
  },

  // Block Users

  blockUser: (req, res) => {
    try {
      let userId = req.params.id;
      userHelpers
        .blockUser(userId)
        .then(() => {
          res.redirect("/admin_panel/users");
        })
        .catch((err) => {
          res.render("user/500Page");
          console.log(err);
        });
    } catch (error) {
      res.render("user/500Page");
    }
  },

  // Unblock Users

  unblockUser: (req, res) => {
    try {
      let userId = req.params.id;
      userHelpers
        .unblockUser(userId)
        .then(() => {
          res.redirect("/admin_panel/users");
        })
        .catch((err) => {
          res.render("user/500Page");
          console.log(err);
        });
    } catch (error) {
      res.render("user/500Page");
    }
  },

  /////Category Management/////

  // Get Category

  getCategory: (req, res) => {
    try {
      productHelpers
        .getAllcategory()
        .then((category) => {
          res.render("admin/add-category", {
            layout: "admin-layout",
            category,
          });
        })
        .catch((err) => {
          res.render("user/500Page");
          console.log(err);
        });
    } catch (error) {
      res.render("user/500Page");
    }
  },

  // Add Category

  addCategory: (req, res) => {
    try {
      productHelpers
        .addCategory(req.body)
        .then((response) => {
          if (response == false) {
            res.send({ value: "error" });
          } else {
            res.send({ value: "good" });
          }
        })
        .catch((err) => {
          res.render("user/500Page");
          console.log(err);
        });
    } catch (error) {
      res.render("user/500Page");
    }
  },

  // Delete Category

  deleteCategory: (req, res) => {
    try {
      let catId = req.params.id;
      productHelpers
        .deleteCategory(catId)
        .then(() => {
          res.redirect("/admin_panel/category");
        })
        .catch((err) => {
          res.render("user/500Page");
          console.log(err);
        });
    } catch (error) {
      res.render("user/500Page");
    }
  },

  // Edit Category

  editCategory: (req, res) => {
    try {
      let catId = req.params.id;
      productHelpers
        .getCategory(catId)
        .then((category) => {
          res.render("admin/edit-catagory", {
            layout: "admin-layout",
            category,
          });
        })
        .catch((err) => {
          res.render("user/500Page");
          console.log(err);
        });
    } catch (error) {
      res.render("user/500Page");
    }
  },

  // Update Category

  updateCategory: (req, res) => {
    try {
      let cate = req.body;
      let cateId = req.params.id;
      productHelpers
        .updateCategory(cate, cateId)
        .then(() => {
          res.redirect("/admin_panel/category");
        })
        .catch((err) => {
          res.render("user/500Page");
          console.log(err);
        });
    } catch (error) {
      res.render("user/500Page");
    }
  },

  // Get Admin Orders //

  getAdminOrders: (req, res) => {
    try {
      orderHelpers
        .getAdminOrders(req.session.user._id)
        .then((data) => {
          res.render("admin/order_management", {
            data,
            layout: "admin-layout",
          });
        })
        .catch((err) => {
          res.render("user/500Page");
          console.log(err);
        });
    } catch (error) {
      res.render("user/500Page");
    }
  },

  // Get Admin Orders Detailes //

  getAdminOrdersDetailes: (req, res) => {
    try {
      orderHelpers
        .getAdminOrdersDetailes(req.session.user._id, req.params.id)
        .then((data) => {
          res.render("admin/order_detailes", { data, layout: "admin-layout" });
        })
        .catch((err) => {
          res.render("user/500Page");
          console.log(err);
        });
    } catch (error) {
      res.render("user/500Page");
    }
  },

  updateOrder: (req, res) => {
    try {
      orderHelpers
        .updateOrder(req.body)
        .then((response) => {
          res.json(response);
        })
        .catch((err) => {
          res.render("user/500Page");
          console.log(err);
        });
    } catch (error) {
      res.render("user/500Page");
    }
  },

  chartGraph: (req, res) => {
    try {
      chartHelpers
        .monthWiseSales()
        .then((pricesdata) => {
          res.json(pricesdata);
        })
        .catch((err) => {
          res.render("user/500Page");
          console.log(err);
        });
    } catch (error) {
      res.render("user/500Page");
    }
  },

  addCoupon: (req, res) => {
    try {
      res.render("admin/add- coupon", { layout: "admin-layout" });
    } catch (error) {
      res.render("user/500Page");
    }
  },

  getCouponCode: async (req, res) => {
    try {
      let coupenCode = await voucher_codes.generate({
        prefix: "Evara-",
        length: 5,
        count: 1,
      });
      res.send({ coupenCode });
    } catch (error) {
      console.log(error);
      res.render("user/500Page");
    }
  },

  postAddCoupon: (req, res) => {
    try {
      let obj = {
        coupon: req.body.coupen,
        discountType: req.body.discountType,
        cappedAmount: req.body.cappedAmount,
        amount: req.body.discountAmount,
        amountValidity: req.body.amountValidity,
        percentage: req.body.discountPercentage,
        validity: req.body.validity,
        description: req.body.description,
        redeemTime: req.body.redeemTime,
      };
      couponHelpers
        .addCoupon(obj)
        .then((response) => {
          res.json(response);
        })
        .catch((err) => {
          res.render("user/500Page");
          console.log(err);
        });
    } catch (error) {
      res.render("user/500Page");
    }
  },
  getCoupon: async (req, res) => {
    try {
      let couponData = await db.coupon.find({});
      res.render("admin/couponManagement", {
        couponData,
        layout: "admin-layout",
      });
    } catch (error) {
      res.render("user/500Page");
    }
  },

  deleteCoupon: (req, res) => {
    try {
      let copId = req.params.id;
      couponHelpers
        .deleteCoupon(copId)
        .then(() => {
          res.json({ status: true });
        })
        .catch((err) => {
          res.render("user/500Page");
          console.log(err);
        });
    } catch (error) {
      res.render("user/500Page");
    }
  },

  bannerManagement: async (req, res) => {
    try {
      let banners = await db.banner.find();
      res.render("admin/bannerManagement", { layout: "admin-layout", banners });
    } catch (error) {
      res.render("user/500Page");
    }
  },

  addBannerGet: async (req, res) => {
    try {
      let category = await productHelpers.getAllcategory();
      res.render("admin/add-banner", { layout: "admin-layout", category });
    } catch (error) {
      res.render("user/500Page");
    }
  },

  addBannerPost: (req, res) => {
    try {
      bannerHelpers
        .addBanner(req.body)

        .then((insertedId) => {
          let image = req.files.image;
          let bannerName = insertedId;
          image.mv(`./public/bannerImages/${bannerName}.jpg`, (err) => {
            if (!err) {
              console.log("add Banner");
            } else {
              console.log(err);
            }
          });
          res.redirect("/admin_panel/banner/add_banner");
        });
    } catch (error) {
      res.render("user/500Page");
    }
  },

  disableBanner: (req, res) => {
    try {
      bannerHelpers.disableBanner(req.params.id).then(() => {
        res.redirect("/admin_panel/banner");
      });
    } catch (error) {
      res.render("user/500Page");
    }
  },

  enableBanner: (req, res) => {
    try {
      bannerHelpers.enableBanner(req.params.id).then(() => {
        res.redirect("/admin_panel/banner");
      });
    } catch (error) {
      res.render("user/500Page");
    }
  },

  getrevenueYearly: (req, res) => {
    try {
      let year = req.query.year;
      reportHelpers
        .getrevenueYearly(year)
        .then((response) => {
          res.send(response);
        })
        .catch((err) => {
          res.render("user/500Page");
          console.log(err);
        });
    } catch (error) {
      res.render("user/500Page");
    }
  },
  getDailydata: async (req, res) => {
    try {
      let month = req.query.month;
      let year = req.query.year;
      reportHelpers
        .getRevenuebyDay(month, year)
        .then((response) => {
          res.send(response);
        })
        .catch((err) => {
          res.render("user/500Page");
          console.log(err);
        });
    } catch (error) {
      res.render("user/500Page");
    }
  },

  getOrderdataMontly: (req, res) => {
    try {
      let year = req.query.year;
      reportHelpers
        .getRevenuebyMonth1(year)
        .then((response) => {
          res.send(response);
        })
        .catch((err) => {
          res.render("user/500Page");
          console.log(err);
        });
    } catch (error) {
      res.render("user/500Page");
    }
  },

  // getExceldata: (req, res) => {
  //   try {
  //     let year = new Date().getFullYear();
  //     reportHelpers
  //       .getRevenuebyMonth1(year)
  //       .then(async (response) => {
  //         const Report = [];

  //         if (response?.length) {
  //           response.forEach((e) => {
  //             const data = {};
  //             data["Month"] = e._id;
  //             data["Orders"] = e.orders;
  //             data["Revenue"] = e.totalCount;
  //             data["Quantity"] = e.totalQuantity;
  //             Report.push(data);
  //           });
  //         }

  //         const workSheet = await XLSX.utils.json_to_sheet(Report);

  //         const workBook = await XLSX.utils.book_new();

  //         XLSX.utils.book_append_sheet(workBook, workSheet, "Report");

  //         XLSX.write(workBook, { bookType: "xlsx", type: "buffer" });

  //         XLSX.write(workBook, { bookType: "xlsx", type: "binary" });

  //         XLSX.writeFile(workBook, "Montly_Data.xlsx");
  //       })
  //       .catch((err) => {
  //         res.render("user/500Page");
  //         console.log(err);
  //       });
  //     res.send({ status: true });
  //   } catch (error) {
  //     console.log(error);
  //     res.render("user/500Page");
  //   }
  // },
};
