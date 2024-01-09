const {
  getCategories,
  getAdminCategories,
  getCategoryById,
  createCategory,
  deleteCategory,
  getAllArtsInCategory,
  getAllCollectionsInCategory,
  getAllCollectionsInCategoryForHeroSection,
} = require("../controller/category");

const { isAdmin } = require("../middleware/checkRoles");
const { verifyToken } = require("../middleware/auth");
const upload = require("../middleware/imageUpload");

const CategoryRouter = require("express").Router();

CategoryRouter.get("/get_categories", getCategories);
CategoryRouter.get("/get-admin_categories", getAdminCategories);
CategoryRouter.get("/get_categories_by_id/:id", getCategoryById);

// Apply both verifyToken and isAdmin middleware to these two routes
CategoryRouter.post(
  "/create_category",
  verifyToken,
  isAdmin,
  upload,
  createCategory
);
CategoryRouter.delete(
  "/delete_categories/:id",
  verifyToken,
  isAdmin,
  deleteCategory
);

CategoryRouter.get("/get_all_arts_in_category/:id", getAllArtsInCategory);
CategoryRouter.get(
  "/get_all_collection_and_arts_in_category/:id",
  getAllCollectionsInCategory
);
CategoryRouter.get(
  "/get_all_collection_for_hero_section/:id",
  getAllCollectionsInCategoryForHeroSection
);

module.exports = CategoryRouter;
