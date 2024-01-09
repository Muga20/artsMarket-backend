const Users = require("../models/user/users");
const { body, validationResult } = require("express-validator");
const Collection = require("../models/collection/collection");
const { createNameSlug } = require("../constants/slug");
const Tag = require("../models/tags/tags");
const CollectionTags = require("../models/tags/collectionTag");
const Art = require("../models/art/art");
const Category = require("../models/category/category");
const ArtsLike = require("../models/art/artLikes");
const Earning = require("../models/Earning/CreatorEarning");
const cloudinary = require("cloudinary").v2

require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const manipulateCollectionWithTags = (collections) => {
  return collections.map((collection) => {
    const collectionData = collection.get();
    const tagNames = collectionData.collection_tags.map((tag) => tag.tag.name);
    collectionData.tag_names = tagNames;
    delete collectionData.collection_tags;
    return collectionData;
  });
};

/**
 * This gets all the Collections
 * @returns {array} - The array of collections
 * */

const getCollections = async (req, res) => {
  try {
    const collections = await Collection.findAll({
      include: [
        {
          model: CollectionTags,
          attributes: ["tagId"],
          include: [
            {
              model: Tag,
              attributes: ["name"],
            },
          ],
        },
        {
          model: Art, // Include the Art model to calculate floor price and total revenue
          attributes: ["price"], // Include only the 'price' attribute
        },
      ],
    });

    const collectionsWithTags = manipulateCollectionWithTags(collections);

    // Calculate floor price and total collection revenue for each collection
    // Calculate floor price and total collection revenue for each collection
    const collectionsWithStats = collectionsWithTags.map((collection) => {
      const artworks = collection.artworks || []; // Access artworks from the collection object

      const floorPrice = artworks.reduce((minPrice, art) => {
        const price = parseFloat(art.price); // Convert price to a number

        return price && price < minPrice ? price : minPrice; // Check if price is valid
      }, Number.MAX_SAFE_INTEGER);

      const totalRevenue = artworks.reduce((total, art) => {
        const price = parseFloat(art.price);
        return price ? total + price : total;
      }, 0);

      return {
        ...collection,
        floor_price: floorPrice === Number.MAX_SAFE_INTEGER ? 0 : floorPrice,
        total_collection_revenue: totalRevenue,
      };
    });

    res.json({ collectionsWithStats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * This gets all the Collections by a user
 * @returns {array} - The array of collections
 * */

const getCollectionsByUser = async (req, res) => {
  try {
    const token = req.user;
    const userId = token.userId.id;

    const collections = await Collection.findAll({
      where: { userId: userId },
      include: [
        {
          model: CollectionTags,
          attributes: ["tagId"],
          include: [
            {
              model: Tag,
              attributes: ["name"],
            },
          ],
        },
        {
          model: Art, // Include the Art model to calculate floor price and total revenue
          attributes: ["price"], // Include only the 'price' attribute
        },
      ],
    });

    const collectionsWithTags = manipulateCollectionWithTags(collections);

    // Calculate floor price and total collection revenue for each collection
    // Calculate floor price and total collection revenue for each collection
    const collectionsWithStats = collectionsWithTags.map((collection) => {
      const artworks = collection.artworks || []; // Access artworks from the collection object

      const floorPrice = artworks.reduce((minPrice, art) => {
        const price = parseFloat(art.price); // Convert price to a number

        return price && price < minPrice ? price : minPrice; // Check if price is valid
      }, Number.MAX_SAFE_INTEGER);

      const totalRevenue = artworks.reduce((total, art) => {
        const price = parseFloat(art.price);
        return price ? total + price : total;
      }, 0);

      return {
        ...collection,
        floor_price: floorPrice === Number.MAX_SAFE_INTEGER ? 0 : floorPrice,
        total_collection_revenue: totalRevenue,
      };
    });

    res.json({ collectionsWithStats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCollectionsByUserVisited = async (req, res) => {
  try {
    const userId = req.params.id;

    const page = parseInt(req.query.page);
    const pageSize = parseInt(req.query.pageSize);
    const offset = (page - 1) * pageSize;


    const collections = await Collection.findAll({
      where: { userId: userId },
      include: [
        {
          model: CollectionTags,
          attributes: ["tagId"],
          include: [
            {
              model: Tag,
              attributes: ["name"],
            },
          ],
        },
        {
          model: Art, // Include the Art model to calculate floor price and total revenue
          attributes: ["price"], // Include only the 'price' attribute
        },
      ],
      offset,
      limit: pageSize,
    });

    const collectionsWithTags = manipulateCollectionWithTags(collections);

    // Calculate floor price and total collection revenue for each collection
    // Calculate floor price and total collection revenue for each collection
    const collectionsWithStats = collectionsWithTags.map((collection) => {
      const artworks = collection.artworks || []; // Access artworks from the collection object

      const floorPrice = artworks.reduce((minPrice, art) => {
        const price = parseFloat(art.price); // Convert price to a number

        return price && price < minPrice ? price : minPrice; // Check if price is valid
      }, Number.MAX_SAFE_INTEGER);

      const totalRevenue = artworks.reduce((total, art) => {
        const price = parseFloat(art.price);
        return price ? total + price : total;
      }, 0);

      return {
        ...collection,
        floor_price: floorPrice === Number.MAX_SAFE_INTEGER ? 0 : floorPrice,
        total_collection_revenue: totalRevenue,
      };
    });

    res.json({ collectionsWithStats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * This gets a Collection by its ID for a user
 * @param {string} id - The id of the collection
 * @returns {object} - The collection object
 * */

const getCollectionByIdForUser = async (req, res) => {
  try {
    const collection_id = req.params.id;
    

    // Find the collection by its ID and the associated user's ID
    const collection = await Collection.findOne({
      where: { id: collection_id },
      include: [
        {
          model: CollectionTags,
          attributes: ["tagId"],
          include: [
            {
              model: Tag,
              attributes: ["name"],
            },
          ],
        },
        {
          model: Art, // Include the Art model
          attributes: ["id", "name", "image", "description", "price"], // Define the attributes you want from the Art model
          include: [
            {
              model: ArtsLike, // Include the ArtsLike model
              as: "likes", // Specify the alias
              attributes: ["userId"], // We're only interested in counting, so no need to include any attributes
            },
          ],
        },
        {
          model: Users, // Include the User model
          attributes: ["username"], // Include only the 'username' attribute of the User model
        },
        {
          model: Category, // Include the Category model
          attributes: ["name"], // Include only the 'name' attribute of the Category model
        },
        {
          model: Earning,
          as: "creatorEarnings"
        }
      ],
    });

    if (collection) {
      const collectionData = collection.get();
      const tagNames = collectionData.collection_tags.map(
        (tag) => tag.tag.name
      );
      collectionData.tag_names = tagNames;
      delete collectionData.collection_tags;

      const creatorEarning = collection.creatorEarnings.reduce(
        (total, collection) => total + (parseFloat(collection.amount) || 0), // Ensure valid numeric price
        0
      );
      

      // Calculate the Total Collection Revenue (assuming 'price' property in the Art model)
      const totalCollectionRevenue = collection.artworks.reduce(
        (total, art) => total + (parseFloat(art.price) || 0), // Ensure valid numeric price
        0
      );

      // Calculate the Floor Price (minimum value among the art prices)
      const floorPrice = collection.artworks.reduce(
        (minPrice, art) => {
          const artPrice = parseFloat(art.price);
          return !isNaN(artPrice) && artPrice < minPrice ? artPrice : minPrice;
        },
        Number.MAX_SAFE_INTEGER // Initialize with a large value
      );

      // Assign username and category name to collectionData
      collectionData.username = collectionData.user.username;
      collectionData.category_name = collectionData.category.name;

      // Remove user and category properties from collectionData
      delete collectionData.user;
      delete collectionData.category;

      // Add the number of arts, total collection revenue, floor price, and art likes to the collectionData object
      collectionData.number_of_arts = collection.artworks.length;
      collectionData.creator_earning = creatorEarning;
      collectionData.total_collection_revenue = totalCollectionRevenue;
      collectionData.floor_price =
        floorPrice === Number.MAX_SAFE_INTEGER ? 0 : floorPrice;

      // Enhance each artwork with the likes data
      collectionData.artworks = collection.artworks.map((art) => {
        const likesData = art.likes ? art.likes.map((like) => like.userId) : [];
        return {
          ...art.get(),
          likes: likesData,
        };
      });

      res.json({ collectionData });
    } else {
      res.status(404).json({ error: "Collection not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get the image URL for the uploaded file.
 * @param {Object} req - The request object containing the uploaded file.
 * @returns {string} - The complete image URL.
 */
const getImageUrl = (req) => {
  const baseUrl = process.env.BASE_URL; // Replace with your base URL for serving images
  return `${baseUrl}/${req.file.path}`;
};

/**
 * Create a new collection.
 * @param {string} name - The name of the collection.
 * @param {string} description - The description of the collection.
 * @param {string} image - The image of the collection.
 * @param {string} category_id - The category_id of the collection.
 * @returns {object} - The collection object.
 */
const createCollection = async (req, res) => {
  const { name, description, categoryId, tagId } = req.body;

  if (!name || !categoryId || !tagId) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const accessToken = req.user;
    const user_id = accessToken.userId.id;

    const existingCollection = await Collection.findOne({
      where: { name, userId: user_id }
    });

    if (existingCollection) {
      return res.status(400).json({ message: "Collection with this name already exists for the user" });
    }

    const user = await Users.findByPk(user_id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let slug = createNameSlug(req.body.name);
    let counter = 1;

    while ((await Collection.count({ where: { slug: slug } })) > 0) {
      counter++;
      slug = createNameSlug(req.body.name, counter);
    }

    const result = await cloudinary.uploader.upload(req.file.path, { folder: "artsMarket" });

    const collection = await Collection.create({
      userId: user_id,
      image: result.secure_url,
      name: name,
      cover_photo: result.secure_url,
      slug: slug,
      description: description,
      CategoryId: categoryId,
    });

    const tag = await Tag.findOne({
      where: {
        id: tagId,
      },
    });

    if (tag) {
      await CollectionTags.create({
        collectionId: collection.id,
        tagId: tag.id,
      });
    }

    res.json({ data: collection });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Helper function to update the collection record in the database

const updateCollection = async (req, res, isCoverPhoto = false) => {
  try {
    const collection_id = req.params.id;
    const token = req.user;

    const userId = token.userId.id;

    const user = await Users.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const collection = await Collection.findByPk(collection_id);

    // Get the existing data from the collection record
    const existingData = {
      name: collection.name,
      image: collection.image,
      cover_photo: collection.cover_photo,
    };

    const { name } = req.body;

    const imageType = isCoverPhoto ? "cover_photo" : "image";
    const image = getImageUrl(req);

    // Create updated data object with new image URLs and optional name
    const updatedData = {
      ...existingData,
      name: name || existingData.name, // Update only if 'name' is provided
      [imageType]: image || existingData[imageType],
    };

    // Update the collection record in the database with the new data
    await collection.update(updatedData, { where: { id: collection_id } });

    res
      .status(200)
      .json({ message: "Collection updated", updatedCollection: updatedData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * This replaces the images of a collection
 * @param {string} id - The id of the collection
 * @returns {object} - The collection object
 */
const replaceImages = async (req, res) => {
  await updateCollection(req, res);
};

/**
 * This replaces the cover photo of a collection
 * @param {string} id - The id of the collection
 * @returns {object} - The collection object
 */
const updateCollectionImages = async (req, res) => {
  await updateCollection(req, res, true); // Indicate this is for cover photo
};

/**
 * This updates the name of a collection
 * @param {string} id - The id of the collection
 * @returns {object} - The collection object
 */

const updateNameOfCollection = async (req, res) => {
  try {
    const collection_id = req.params.id;
    const token = req.user;
    const userId = token.userId.id;

    const user = await Users.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { name, description } = req.body;

    const updateData = { name, description }; // Update only the name and description

    const [affectedRows] = await Collection.update(updateData, {
      where: { id: collection_id, userId }, // Only allow update if collection belongs to the user
    });

    if (affectedRows > 0) {
      res.status(200).json({
        success: true,
        message: "Collection name and description updated",
      });
    } else {
      res.status(404).json({ success: false, error: "Collection not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * This deletes a collection
 * @param {string} id - The id of the collection
 * @returns {object} - The collection object
 */

/**
 * Delete a collection by its ID.
 * @param {Object} req - The request object with the collection ID as a parameter.
 * @param {Object} res - The response object.
 */
const deleteCollection = async (req, res) => {
  try {
    // Extract the collection ID from the request parameters
    const collection_id = req.params.id;

    // Get the user token from the request
    const token = req.user;

    // Extract the user ID from the token
    const userId = token.userId.id;

    // Find the user based on their user ID
    const user = await Users.findOne({ where: { id: userId } });

    // If the user is not found, return a 404 response
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find the collection based on its ID
    const collection = await Collection.findByPk(collection_id);

    // If the collection is found
    if (collection) {
      if (collection.userId === userId) {
        // Check if the collection belongs to the user
        await collection.destroy();
        res.json({ message: "Collection deleted successfully" });
      } else {
        // Return a 403 response if the user is not authorized to delete the collection
        res
          .status(403)
          .json({ error: "You are not authorized to delete this collection" });
      }
    } else {
      // Return a 404 response if the collection is not found
      res.status(404).json({ error: "Collection not found" });
    }
  } catch (error) {
    // Handle any errors that occur during the collection deletion process
    res.status(500).json({ error: error.message });
  }
};

const getCollectionsForHeroSection = async (req, res) => {
  try {
    const collections = await Collection.findAll({
      include: [
        {
          model: CollectionTags,
          attributes: ["tagId"],
          include: [
            {
              model: Tag,
              attributes: ["name"],
            },
          ],
        },
        {
          model: Users, // Include the User model to access the user's name
          attributes: ["username"], // Include only the 'name' attribute
        },
        {
          model: Art, // Include the Art model to calculate floor price and total revenue
          attributes: ["price"], // Include only the 'price' attribute
        },
      ],
    });

    const collectionsWithTags = manipulateCollectionWithTags(collections);

    // Calculate floor price and total collection revenue for each collection
    const collectionsWithStats = collectionsWithTags.map((collection) => {
      const artworks = collection.artworks || []; // Access artworks from the collection object
      const user = collection.user || {}; // Access the user object

      const floorPrice = artworks.reduce((minPrice, art) => {
        const price = parseFloat(art.price); // Convert price to a number

        return price && price < minPrice ? price : minPrice; // Check if price is valid
      }, Number.MAX_SAFE_INTEGER);

      const totalRevenue = artworks.reduce((total, art) => {
        const price = parseFloat(art.price);
        return price ? total + price : total;
      }, 0);

      return {
        ...collection,
        user: user.username,
        floor_price: floorPrice === Number.MAX_SAFE_INTEGER ? 0 : floorPrice,
        total_collection_revenue: totalRevenue,
      };
    });
// displying 20 collections at a time
    const page = req.query.page || 1;
    const pageSize = req.query.pageSize || 20;

    const startIndex = (page - 1) * pageSize;

    const endIndex = Math.min(startIndex + pageSize, collectionsWithStats.length);


    const paginatedArts = collectionsWithStats.slice(startIndex, endIndex);
    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }
    const randomlySelectedCollections = shuffleArray(paginatedArts);

    res.json({ arts: randomlySelectedCollections});
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
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
};
