const { parse } = require("dotenv");
const ObjectId = require("objectid");
const { response } = require("../app");
const { user } = require("../Model/connection");
const db = require("../Model/connection");

module.exports = {
    addBanner:(data)=>{
      
        return new Promise(async (resolve, reject) => {
            try {
                let obj = {
                    mainBannerTitle: data.title,
                    mainBannerDescription: data.description,
                    mainBannerCategory: data.category
                }
                let banner = await db.banner(obj)
                await banner.save()
                resolve(banner._id)
            } catch (error) {
                console.log(error);
            }
        })
    },

    disableBanner: (id) => {
        return new Promise(async (resolve, reject) => {
            try {
                let status = await db.banner.updateOne({ _id: id }, {
                    $set: {
                        checked: false
                    }
                })

                resolve()
            } catch (error) {
                console.log(error);
            }
        })
    },

    enableBanner: (id) => {
        return new Promise(async (resolve, reject) => {
            try {
                let status = await db.banner.updateOne({ _id: id }, {
                    $set: {
                        checked: true
                    }
                })

                resolve()
            } catch (error) {
                console.log(error);
            }
        })

    },
}