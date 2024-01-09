// Import necessary models
const ArtsLike = require("../models/art/artLikes");
const Art = require("../models/art/art");
const Users = require("../models/user/users");
const sequelize = require("sequelize");


/**
 * Create or remove a like for an art item.
 * @param {Object} req - The request object with artId in the request body
 * @param {Object} res - The response object
 */
const createLike = async (req, res) => {
  try {
    const artId = req.body.artId;

    const accessToken = req.user;
    const user_id = accessToken.userId.id;

    // Check if the user has already liked the item
    const existingLike = await ArtsLike.findOne({
      where: {
        userId: user_id,
        artId: artId,
      },
    });

    if (existingLike) {
      // Delete the existing like
      await existingLike.destroy();
      return res.status(200).send({ message: "Like removed successfully" });
    }

    // Create a new like
    const like = await ArtsLike.create({
      userId: user_id,
      artId: artId,
    });

    res.status(200).send(like);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

/**
 * Get all art items liked by a user, including art details and likes count.
 * @param {Object} req - The request object with the user's access token
 * @param {Object} res - The response object
 */
const getAllArtsLikedByUser = async (req, res) => {
  try {
    const accessToken = req.user;
    const user_id = accessToken.userId.id;

    // Query the database to find all arts liked by the user
    const arts = await ArtsLike.findAll({
      where: {
        userId: user_id,
      },
      include: [
        {
          model: Art,
          as: "art",
          attributes: [
            "id",
            "name",
            "image",
            "category_id",
            "collection_id",
            "price",
            "description",
            "width",
            "height",
            "year",
            "serial",
            "status",
            "createdAt",
            "isExplicit",
            // Include the derived attribute "likesCount"
            [
              sequelize.literal(
                "(SELECT COUNT(*) FROM likes WHERE likes.artId = art.id)"
              ),
              "likesCount",
            ],
          ],
          include: [
            {
              model: ArtsLike,
              as: "likes",
              attributes: [],
            },
          ],
        },
        { model: Users, as: "user" },
      ],
    });

    if (!arts) {
      return res.status(404).json({ message: "Art not found" });
    }

    // Enhance the arts data with likes count and restructure it for the response
  

    res.json({arts});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createLike,
  getAllArtsLikedByUser,
};
