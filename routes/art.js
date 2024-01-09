const {
  getArts,
  getAllData,
  getArtById,
  createArt,
  updateArt,
  deleteArt,
  getArtsBelongingToUser,
  getAllArtsForVisitedUser,
  getArtsForHeroSection,
  editArt
} = require("../controller/art");

const { isAdmin } = require("../middleware/checkRoles");
const { verifyToken } = require("../middleware/auth");
const upload = require("../middleware/imageUpload");
const { createLike, getAllArtsLikedByUser } = require("../controller/artLikes");

const {   getArtsOwnership, getArtOwnershipById, changeArtOwnership } = require("../controller/ArtOwnership");
// const checkImageContent = require("../middleware/verifyExplicitContent");

const ArtRoutes = require("express").Router();


ArtRoutes.get("/get_all", getArts); // Excluded from verifyToken middleware
ArtRoutes.get("/get_art_by_id/:id", getArtById);
ArtRoutes.post("/create_art", upload,verifyToken, createArt);
ArtRoutes.put("/update_art/:id", updateArt, verifyToken);
ArtRoutes.delete("/delete_art/:id",verifyToken, deleteArt);
ArtRoutes.get("/get_arts_by_user",verifyToken, getArtsBelongingToUser);
ArtRoutes.get("/get_all_data",verifyToken, getAllData);
ArtRoutes.get("/get_all_arts_for_visited_user/:id",verifyToken, getAllArtsForVisitedUser);
ArtRoutes.get("/get_arts_for_hero_section", getArtsForHeroSection);
ArtRoutes.put("/edit_art_by_id/:id", editArt);


// ArtLikes
ArtRoutes.post("/create_like",verifyToken, createLike);
ArtRoutes.get("/get_all_likes_by_user",verifyToken, getAllArtsLikedByUser);

// ArtOwnership
ArtRoutes.post("/changeArtOwnership",verifyToken, changeArtOwnership);
ArtRoutes.get("/artOwnership", verifyToken, isAdmin, getArtsOwnership);
ArtRoutes.get("/getArtOwnershipById/:id",verifyToken, isAdmin, getArtOwnershipById);


module.exports = ArtRoutes;