const {
  getCollections,
  getCollectionsByUser,
  createCollection,
  deleteCollection,
  replaceImages,
  updateCollectionImages,
  updateNameOfCollection,
  getCollectionByIdForUser,
  getCollectionsByUserVisited,
  getCollectionsForHeroSection,
} = require("../controller/collection");



const { isAdmin, isVerified } = require("../middleware/checkRoles");
const { verifyToken } = require("../middleware/auth");

const upload = require("../middleware/imageUpload");

const express = require("express");

const CollectionRouter = express.Router();



CollectionRouter.get("/collections", getCollections); // Excluded from verifyToken middleware
CollectionRouter.post("/create_collection", upload,verifyToken, createCollection);
CollectionRouter.delete("/delete_collection/:id",verifyToken, deleteCollection);
CollectionRouter.patch("/replace_profile_image/:id", upload,verifyToken, replaceImages);
CollectionRouter.patch(
  "/update_collection_images/:id",
  upload,verifyToken,
  updateCollectionImages
);
CollectionRouter.patch(
  "/update_name_of_collection/:id",verifyToken,
  updateNameOfCollection
);
CollectionRouter.get("/get_collections_by_user",verifyToken, getCollectionsByUser); // Excluded from verifyToken middleware
CollectionRouter.get(
  "/get_collection_by_id_for_user/:id",
  getCollectionByIdForUser
);
CollectionRouter.get(
  "/get_collections_by_user_visited/:id",verifyToken,
  getCollectionsByUserVisited
);
CollectionRouter.get(
  "/get_collections_for_hero_section",
  getCollectionsForHeroSection
);


module.exports = CollectionRouter;