const {
  getTags,
  getTagById,
  createTag,
  getCollectionByTag,
  deleteTag,
  getAllCollectionsByTag
} = require("../controller/tags");

const { isAdmin } = require("../middleware/checkRoles");
const { verifyToken } = require("../middleware/auth");

const TagRoutes = require("express").Router();



TagRoutes.get("/get_all", getTags);
TagRoutes.get("/get_tags_by_id/:id", getTagById);
TagRoutes.post("/create_tags",verifyToken, isAdmin, createTag);
TagRoutes.get("/get_tags_by_collection/:id/collection", getCollectionByTag);
TagRoutes.delete("/delete_tags/:id",verifyToken, isAdmin, deleteTag);
TagRoutes.get("/get_all_collections_by_tag", getAllCollectionsByTag);

module.exports = TagRoutes;
