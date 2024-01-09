const Art = require("../models/art/art");
const Category = require("../models/category/category");
const Collection = require("../models/collection/collection");
const Users = require("../models/user/users");
const ArtId = require("../models/art/artRefferenceId");
const ArtOwnerShip = require("../models/art/artOwnerShip");
const Earning = require("../models/Earning/CreatorEarning");






/**
 * This gets all the Arts (presumably artworks or creative works)
 * @returns {array} - An array of art objects
 */
const getArtsOwnership = async (req, res) => {
  try {
      // Extract page and pageSize from the request query parameters, defaulting to 1 and 10 respectively
      const page = parseInt(req.query.page);
      const pageSize = parseInt(req.query.pageSize);
    
      // Calculate the offset based on the page and pageSize
      const offset = (page - 1) * pageSize;

    // Retrieve all art objects from the database
    const arts = await ArtId.findAll({
      offset,
      limit: pageSize,
      include: [
        {
          model: Art, 
          as: "art",
          include:[{
                model: Category,
                attributes: ["name"],
                as: "category",
              },]
        },
      ],
    });


    res.status(200).send({ arts });
  } catch (error) {
    // Handle any errors that occur during the retrieval process
    res.status(500).send({ message: error.message });
  }
};



/**
 * Get details of a specific art by its ID, including related data like category, collection, and art mediums.
 * @param {Object} req - The request object with the art ID as a parameter
 * @param {Object} res - The response object
 */
const getArtOwnershipById = async (req, res) => {
  try {

    // Extract page and pageSize from the request query parameters, defaulting to 1 and 10 respectively
    const page = parseInt(req.query.page);
    const pageSize = parseInt(req.query.pageSize);
  
    // Calculate the offset based on the page and pageSize
    const offset = (page - 1) * pageSize;

    const id = req.params.id;

    const artOwnershipRecords = await ArtOwnerShip.findAll({
      where: { referenceId: id },

      include: [
        {
          model: ArtId,
          as: "artRefferenceId",
          include: [
            {
              model: Art,
              as: "art",
              attributes: [
                "id",
                "name",
                "price",
                "width",
                "height",
                "year",
                "serial",
              ],
            },
          ],
        },
        {
          model: Users,
          as: "users",
        },
      ],
      offset,
      limit: pageSize,
    });


    // Send a successful response with the art ownership records
    return res.status(200).send({ artOwnershipRecords });
  } catch (error) {
    // Handle any errors that occur during the retrieval process
    console.error("Error in getArtOwnershipById:", error);
    return res
      .status(500)
      .send({ error: "An error occurred while fetching art ownership records" });
  }
};



const changeArtOwnership = async (req, res) => {
  const { username, art_id, collection_id, collection_name, price, category_id } = req.body;

  if (!username) {
    return res.status(400).json({ message: "username not found" });
  }

  try {
    const token = req.user;
    const userId = token.userId.id;

    const user = await Users.findOne({ where: { username: username } });
    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }



    const checkIfCollectionExisting = await Collection.findOne({
      where: { name: collection_name, userId: user.id },
    });

    const checkIfCategoryExisting = await Category.findOne({
      where: { id: category_id },
    });


    const referenceId = await ArtId.findOne({ where: { art_Id: art_id } });
    if (!referenceId) {
      return res.status(400).json({ message: "art was not found" });
    }

    if (!checkIfCollectionExisting) {
           
      await Art.update(
        {
          userId: user.id,
          description: null,
          category_id: checkIfCategoryExisting.id,
          price: null,
          collection_id: null,
        },
        { where: { id: art_id } }
      );
    } else {
      await Art.update(
        {
          userId: user.id,
          description: null,
          category_id: checkIfCategoryExisting.id,
          price: null,
          collection_id: checkIfCollectionExisting.id 
        },
        { where: { id: art_id } }
      );

    }

    const updateOwnership = await ArtOwnerShip.update({
    ownerShip_status: "previous owner", 
     transaction_date: new Date(), 
    },
      { where: { userId: userId } }
    );

    const earning = await Earning.create({
      collection_id: collection_id,
      userId: userId,
      amount: price
    });

    const createNewOwnership = await ArtOwnerShip.create({
      art_id:art_id,
      userId: userId,
      referenceId: referenceId.id,
    });

    return res.status(200).send({ updateOwnership, createNewOwnership, earning });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};



module.exports = {
  getArtsOwnership,
  getArtOwnershipById,
  changeArtOwnership
};
