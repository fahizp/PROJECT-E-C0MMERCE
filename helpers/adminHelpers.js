const db = require("../Model/connection");

module.exports = {
  //Admin Login

  doAdminlogin: (adminData) => {
    return new Promise(async (resolve, reject) => {
      try {
        let admin = await db.admin.findOne({ email: adminData.email });
        let response = {};
        if (admin) {
          response.admin = admin;
          response.status = true;
          resolve(response);
        } else {
          resolve(response);
        }
      } catch (error) {
        console.log(error);
        reject({ error: "Unauthorized Action" });
      }
    });
  },
};
