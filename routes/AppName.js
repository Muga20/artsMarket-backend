const {
    getApp,
    getAppById,
    createApp,
    EditApp,
    deleteApp
  } = require("../controller/appName");
  
  const { isAdmin } = require("../middleware/checkRoles");
  const { verifyToken } = require("../middleware/auth");
  const upload = require("../middleware/imageUpload");
  const appRoutes = require("express").Router();
  
  
  
  appRoutes.get("/get_all", getApp);
  appRoutes.get("/get_by_id/:id", getAppById);
  appRoutes.post("/create", upload, verifyToken, isAdmin, createApp);
  appRoutes.put("/edit",verifyToken, isAdmin, EditApp);
  appRoutes.delete("/delete/:id",verifyToken, isAdmin, deleteApp);
  
  module.exports = appRoutes;