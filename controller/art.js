const { body, validationResult } = require("express-validator");
const { createNameSlug } = require("../constants/slug");
const Art = require("../models/art/art");
const ArtTag = require("../models/tags/artsTag");
const Tag = require("../models/tags/tags");
const Category = require("../models/category/category");
const Medium = require("../models/category/medium");
const ArtMediums = require("../models/art/artMediums");
const Collection = require("../models/collection/collection");
const ArtsLike = require("../models/art/artLikes");
const Users = require("../models/user/users");
const ArtId = require("../models/art/artRefferenceId");
const ArtOwnerShip = require("../models/art/artOwnerShip");
const sequelize = require("sequelize");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


/**
 * This gets all the Arts (presumably artworks or creative works)
 * @returns {array} - An array of art objects
 */
const getArts = async (req, res) => {
  try {
    const batchSize = 20;
 
        const art = await Art.findAll({
          include: [
            {
              model: ArtMediums,
              attributes: ["medium_id"],
            },
          ],
          order: sequelize.literal('RAND()'), // Order randomly
          limit: batchSize,
        });

        // Filter out art objects with empty values
        const checkArt = art.filter(art => {
          return (
            art.collection_id !== null &&
            art.price !== null
            // Add additional conditions if needed
          );
        });
  
        // Send a successful response with the filtered random art objects
        res.status(200).send({ arts: checkArt });
  } catch (error) {
    // Handle any errors that occur before displaying the initial set
    res.status(500).send({ message: error.message });
  }
};


/**
 * Get all art objects belonging to the authenticated user
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 */
const getArtsBelongingToUser = async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const pageSize = parseInt(req.query.pageSize);
    const offset = (page - 1) * pageSize;
    // Retrieve the user's access token from the request
    const accessToken = req.user;

    // Extract the user ID from the access token
    const user_id = accessToken.userId.id;

    // Query the database to find all art objects belonging to the user
    const arts = await Art.findAll({
      where: {
        userId: user_id,
      },
      offset,
      limit: pageSize,
    });

    // Send a successful response with the retrieved art objects
    res.status(200).send(arts);
  } catch (error) {
    // Handle any errors that occur during the retrieval process
    res.status(500).send({ message: error.message });
  }
};

/**
 * Get all art objects for a specific user by their user ID
 * @param {Object} req - The request object with user ID as a parameter
 * @param {Object} res - The response object
 */
 const getAllArtsForVisitedUser = async (req, res) => {
  try {    
    // Retrieve the user ID from the request parameters
    const user_id = req.params.id;

    const page = parseInt(req.query.page);
    const pageSize = parseInt(req.query.pageSize);
    const offset = (page - 1) * pageSize;

    // Query the database to find all art objects belonging to the specified user
    const arts = await Art.findAll({
      where: { 
        userId: user_id,
        collection_id: { [sequelize.Op.not]: null }, // Exclude records with null collection_id
        price: { [sequelize.Op.not]: null } // Exclude records with null price
      },
      offset,
      limit: pageSize,
    });


    // Send a successful response with the retrieved art objects
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
const getArtById = async (req, res) => {
  try {
    // Extract the art ID from the request parameters
    const id = req.params.id;

    // Query the database to find the art by its primary key (ID)
    const art = await Art.findByPk(id, {
      include: [
        // Include related data: category, collection, art mediums, and likes
        {
          model: Category,
          attributes: ["name"],
          as: "category",
        },
        {
          model: Collection,
          attributes: ["name"],
          as: "collection",
        },
        {
          model: ArtMediums,
          attributes: [],
          as: "art_mediums",
          include: [
            {
              model: Medium,
              attributes: ["name"],
              as: "medium",
            },
          ],
        },
        {
          model: ArtsLike,
          as: "likes",
          attributes: [],
        },
        {
          model: Users,
          as: "users",
        }
      ],
      attributes: [
        // Specify the attributes to include in the response
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
        [
          // Calculate and include a derived attribute: "likesCount"
          sequelize.literal(
            "(SELECT COUNT(*) FROM likes WHERE likes.artId = artworks.id)"
          ),
          "likesCount",
        ],
      ],
    });

    // If the art is not found, send a 404 response
    if (!art) {
      return res.status(404).send({ error: "Art not found" });
    }

    // Check for missing values
    if (art.collection_id === null || art.price === null) {
      let message = "congratulations! For acquiring Your New Art Add ";

      if (art.collection_id === null) {
        message += "a collection";
      }


      if (art.price === null) {
        message += " add a price";
      }

      // Extract the attributes of category, collection, and art_mediums
      const { category, collection, art_mediums, ...artAttributes } =
        art.dataValues;

      // Retrieve the art mediums using a separate query
      const artMediums = await ArtMediums.findAll({
        where: { artwork_id: id },
        include: [
          {
            model: Medium,
            attributes: ["name"],
            as: "medium",
          },
        ],
      });

      // Extract the names of the art mediums
      const artMediumNames = artMediums.map((medium) => medium.medium.name);

      // Create the desired art object with flattened "category," "collection," and "art_mediums"
      const artObject = {
        ...artAttributes,
        category: category ? category.name : null,
        collection: collection ? collection.name : null,
        art_mediums: artMediumNames,
      };

      // Send a response with the art object and the congratulatory message
      return res.status(200).send({ art: artObject, message });
    }

    // If there are no missing values, proceed with sending just the art object
    const { category, collection, art_mediums, ...artAttributes } =
      art.dataValues;

    const artMediums = await ArtMediums.findAll({
      where: { artwork_id: id },
      include: [
        {
          model: Medium,
          attributes: ["name"],
          as: "medium",
        },
      ],
    });

    const artMediumNames = artMediums.map((medium) => medium.medium.name);

    const artObject = {
      ...artAttributes,
      category: category ? category.name : null,
      collection: collection ? collection.name : null,
      art_mediums: artMediumNames,
    };

    return res.status(200).send({ art: artObject, message: null });
  } catch (error) {
    // Handle any errors that occur during the retrieval process
    console.error("Error in getArtById:", error);
    return res
      .status(500)
      .send({ error: "An error occurred while fetching the art" });
  }
};



/**
 * Get all data required for a user interface, including categories, tags, mediums, and collections.
 * @param {Object} req - The request object with the user's access token
 * @param {Object} res - The response object
 */
const getAllData = async (req, res) => {
  try {
    // Retrieve the user's access token from the request
    const accessToken = req.user;

    // Extract the user ID from the access token
    const user_id = accessToken.userId.id;

    // Query the database to retrieve categories, tags, mediums, and collections for the user
    const categories = await Category.findAll();
    const tags = await Tag.findAll();
    const mediums = await Medium.findAll();

    // Retrieve collections belonging to the user
    const collections = await Collection.findAll({
      where: {
        userId: user_id,
      },
    });

    // Send a successful response with the retrieved data
    res.status(200).json({ categories, tags, mediums, collections });
  } catch (error) {
    // Handle any errors that occur during the retrieval process
    res.status(500).send({ message: error.message });
  }
};

/**
 * This creates a new Art
 * @param {string} name - The name of the art
 * @param {string} description - The description of the art
 * @param {string} image - The image of the art
 * @param {string} category_id - The category_id of the art
 * @returns {object} - The art object
 */

const getImageUrl = (req) => {
  const baseUrl = process.env.BASE_URL; // Replace with your base URL for serving images
  return `${baseUrl}/${req.file.path}`;
};

const createArt = async (req, res) => {
  try {
    const {
      name,
      description,
      categoryId,
      mediumId,
      price,
      collectionId,
      width,
      height,
      tagId,
      year,
      isExplicit,
    } = req.body;

    if (!name || !categoryId || !mediumId || !price || !collectionId || !width || !height || !tagId || !year || !isExplicit) {
      return res.status(400).json({success: false, message: "An error occurred while creating the art"});
    }

    
    // Check if 'price' is a valid number within the specified range
    if (isNaN(price) || price < 500 || price > 50000000) {
      return res.status(400).json({
        message: "Price should be between 10,000 Ksh and 50,000,000 Ksh",
      });
    }

    // Check if 'year' is a valid year and is not below 1995 or greater than the current year
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 1995 || year > currentYear) {
      return res.status(400).json({
        message: "Year should be a valid year between 1995 and the current year",
      });
    }

   

    const accessToken = req.user;
    const user_id = accessToken.userId.id;

    let slug = createNameSlug(req.body.name); // Check this function for any issues
    let counter = 1;

    while ((await Art.count({ where: { slug: slug } })) > 0) {
      counter++;
      slug = createNameSlug(req.body.name, counter); // Check this function for any issues
    }

    // Generate a unique serial number based on some logic
    const timestamp = Date.now().toString();
    const generatedSerial = `ART-${timestamp}-${counter}`;

    let isExplicitValue = 0; // Default value is 0
    if (isExplicit === "yes") {
      isExplicitValue = 1;
    }


    if (!req.file) {
      return res.status(400).json({success: false, message: "image in not inserted"});
    }

    // Ensure that the image variable is correctly populated
    const result = await cloudinary.uploader.upload(req.file.path, { folder: "artsMarket" });

    const art = await Art.create({
      name: name,
      description: description,
      image:  result.secure_url,
      category_id: categoryId,
      serial: generatedSerial,
      slug: slug,
      price: price,
      collection_id: collectionId,
      width: width,
      height: height,
      year: year,
      userId: user_id,
      isExplicit: isExplicitValue,
    });

    // Convert the mediumId to an array of integers and save them to the database
    const mediumIdArray = JSON.parse(mediumId);

    // Check if the mediumId is an array
    if (!Array.isArray(mediumIdArray)) {
      return res.status(400).json({ error: "mediumId should be an array" });
    }

    // Loop through the array of mediumId and save them to the database
    await Promise.all(
      // This is a Promise.all() method that allows you to run multiple promises at the same time
      mediumIdArray.map(async (singleMediumId) => {
        // This is a map() method that allows you to loop through the array
        await ArtMediums.create({
          artwork_id: art.id, // This is the id of the art you just created
          medium_id: singleMediumId, // This is the id of the medium
        });
      })
    );

    const tag = await Tag.findOne({
      where: {
        id: tagId,
      },
    });

    if (tag) {
      await ArtTag.create({
        artId: art.id,
        tagId: tag.id,
      });
    }

    const createdArtId = await ArtId.create({
      art_Id: art.id, // Assuming art.id is the unique identifier for the art piece
    });

    // Create an ArtOwnerShip record using the created ArtId
    await ArtOwnerShip.create({
      referenceId: createdArtId.id, // Using the id of the ArtId record
      userId: user_id,
      ownerShip_status: 'current owner', // Set the current user as the owner
    });

    return res.status(201).send({ art });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

/**
 * Update details of an art.
 * @param {Object} req - The request object with art ID in the parameters and new art details in the request body
 * @param {Object} res - The response object
 */
const updateArt = async (req, res) => {
  try {
    // Extract the art ID from the request parameters
    const id = req.params.id;

    // Extract the user ID from the access token
    const accessToken = req.user;
    const user_id = accessToken.userId.id;

    // Extract the updated art details from the request body
    const { description, price } = req.body;

    // Query the database to find the art by its primary key (ID)
    const art = await Art.findByPk(id);

    // If the art is not found, send a 404 response
    if (!art) {
      return res.status(404).send({ error: "Art not found" });
    }

    // Check if the authenticated user is the owner of the art
    if (art.userId !== user_id) {
      return res
        .status(403)
        .send({ error: "Unauthorized: Art does not belong to you" });
    }

    // Update the art's description and price
    await art.update({
      description,
      price,
    });

    // Send a successful response with the updated art object
    return res.status(200).send({ art });
  } catch (error) {
    // Handle any errors that occur during the update process
    return res.status(500).send({ error: error.message });
  }
};


const editArt = async (req, res) => {
  const id = req.params.id;

  try {
    const { description, price, collection } = req.body;


    let collectionId;

    if (collection) {
      const getCollection = await Collection.findOne({ where: {id: collection } });
      collectionId = getCollection ? getCollection.id : null;
    }


    const updatedArt = await Art.update(
      {
        description: description,
        price: price,
        collection_id: collectionId,
      },
      { where: { id: id } }
    );

    return res.status(201).send({ art: updatedArt });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: error.message });
  }
};


/**
 * This deletes an Art
 * @param {string} id - The id of the art
 * @returns {object} - The art object
 */

const deleteArt = async (req, res) => {
  try {
    const id = req.params.id;

    const accessToken = req.user;
    const user_id = accessToken.userId.id;

    const art = await Art.findByPk(id);

    const artId = await ArtId.findOne({ where: { art_Id: id } });
 
    if (!art || !artId) {
      return res.status(404).send({ error: "Art not found" });
    }

    // Check if the authenticated user is the owner of the art
    if (art.userId !== user_id) {
      return res
        .status(403)
        .send({ error: "Unauthorized: Art does not belong to you" });
    }

    await ArtOwnerShip.destroy({ where: { referenceId: artId.id } });
    await art.destroy();
   

    return (
      res
        // Send a successful response with the updated art object
        .status(204)
        .send("Art deleted successfully. You can no longer access this art")
    );
  } catch (error) {
    // Handle any errors that occur during the update process
    return res.status(500).send({ error: error.message });
  }
};

const getArtsForHeroSection = async (req, res) => {
  try {
    const arts = await Art.findAll({
      include: [
        {
          model: Users,
          as: "users",
          attributes: ["username", "image"],
        },
      ],
    });

    const combinedArtsData = arts.map((art) => ({
      ...art.toJSON(),
      username: art.users.username,
      userImage: art.users.image,
    }));

    res.status(200).send({ combinedArtsData });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};


module.exports = {
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
};