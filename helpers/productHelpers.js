const { response } = require("express");
const { categories } = require("../Model/connection");
const db = require("../Model/connection");

module.exports = {
  // Get All Product

  getAllproduct: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let product = await db.products.find({});
        resolve(product);
      } catch (error) {
        console.log(error);
      }
    });
  },

  // Add Product

  addProduct: (product) => {
    console.log(product);
    return new Promise(async (resolve, reject) => {
      try {
        let data = await db.products(product);
        data.save();
        resolve(data._id);
      } catch (error) {
        console.log(error);
      }
    });
  },

  // Delete Product

  deleteProduct: (proId) => {
    return new Promise(async (resolve, reject) => {
      try {
        await db.products.deleteOne({ _id: proId });
        resolve();
      } catch (error) {
        console.log(error);
      }
    });
  },

  // Get Product

  getProduct: (proId) => {
    return new Promise((resolve, reject) => {
      try {
        db.products.find({ _id: proId }).then((product) => {
          resolve(product);
        });
      } catch (error) {
        console.log(error);
      }
    });
  },

  // Update Product

  updateProduct: (proId, body) => {
    return new Promise(async (resolve, reject) => {
      try {
        await db.products.updateOne(
          { _id: proId },
          {
            $set: {
              name: body.name,
              brand: body.brand,
              category: body.category,
              price: body.price,
              description: body.description,
            },
          }
        );
        resolve();
      } catch (error) {
        console.log(error);
      }
    });
  },

  // Add Category

  addCategory: (category) => {
    return new Promise((resolve, reject) => {
      db.categories
        .find({
          categories: category.categories,
        })
        .then(async (response) => {
          console.log(response);
          if (response.length == 0) {
            try {
              await db.categories(category).save();
              resolve();
            } catch (error) {
              console.log(error);
            }
          } else {
            let response = false;
            resolve(response);
          }
        });
    });
  },

  // Get All Category

  getAllcategory: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let category = await db.categories.find({});
        resolve(category);
      } catch (error) {
        console.log(error);
      }
    });
  },

  deleteCategory: (cateId) => {
    return new Promise(async (resolve, reject) => {
      try {
        await db.categories.deleteOne({ _id: cateId });
        resolve();
      } catch (error) {
        console.log(error);
      }
    });
  },

  getCategory: (cateId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let catagory = await db.categories.find({ _id: cateId });
        resolve(catagory);
      } catch (error) {
        console.log(error);
      }
    });
  },

  updateCategory: (cate, cateId) => {
    return new Promise(async (resolve, reject) => {
      try {
        await db.categories.updateOne(
          { _id: cateId },
          {
            $set: {
              categories: cate.categories,
              description: cate.description,
            },
          }
        );
        resolve();
      } catch (error) {
        console.log(error);
      }
    });
  },
};
