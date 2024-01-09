const {
  getMediums,
  getMedium,
  getMediumById,
  createMedium,
  deleteMedium,
} = require("../controller/medium");

const { isAdmin } = require("../middleware/checkRoles");
const { verifyToken } = require("../middleware/auth");

const MediumRouter = require("express").Router();


MediumRouter.get("/get_mediums", getMediums);
MediumRouter.get("/get_mediums_filter", getMedium);
MediumRouter.get("/get_mediums_by_id/:id", getMediumById);
MediumRouter.post("/create_medium", verifyToken, isAdmin, createMedium);
MediumRouter.delete("/delete_mediums/:id",verifyToken, isAdmin, deleteMedium);

module.exports = MediumRouter;