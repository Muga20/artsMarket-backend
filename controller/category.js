const { body, validationResult } = require("express-validator");
const { createNameSlug } = require("../constants/slug");
const Category = require("../models/category/category");
const Art = require("../models/art/art");
const Collection = require("../models/collection/collection");
const Users = require("../models/user/users");
const cloudinary = require("cloudinary").v2;
const sequelize = require("sequelize");

// const ArtTag = require("../models/tags/artsTag");
// const CollectionTag = require("../models/tags/collectionTag");
// const Tag = require("../models/tags/tags");

require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const getCategories = async (req, res) => {
  try {
    // Query the database to retrieve all categories
    const categories = await Category.findAll();

    // Send a successful response with the retrieved categories
    res.status(200).send({ categories });
  } catch (error) {
    // Handle any errors that occur during the retrieval process
    res.status(500).send({ message: error.message });
  }
};

/**
 * Get all categories.
 * @returns {array} - An array of category objects.
 */
const getAdminCategories = async (req, res) => {
  try {
    // Extract page and pageSize from the request query parameters, defaulting to 1 and 10 respectively
    const page = parseInt(req.query.page);
    const pageSize = parseInt(req.query.pageSize);

    // Calculate the offset based on the page and pageSize
    const offset = (page - 1) * pageSize;

    // Query the database to retrieve paginated categories
    const categories = await Category.findAll({
      offset,
      limit: pageSize,
    });

    // Send a successful response with the retrieved categories
    res.status(200).send({ categories });
  } catch (error) {
    // Handle any errors that occur during the retrieval process
    res.status(500).send({ message: error.message });
  }
};

/**
 * Get a specific category by its ID, including associated art items.
 * @param {Object} req - The request object with the category ID as a parameter
 * @param {Object} res - The response object
 */
const getCategoryById = async (req, res) => {
  try {
    // Extract the category ID from the request parameters
    const id = req.params.id;

    // Query the database to find the category by its primary key (ID), including associated art items
    const category = await Category.findByPk(id, {
      include: [{ model: Art, as: "art" }],
    });

    // If the category is not found, send a 404 response
    if (!category) {
      return res.status(404).send({ error: "Category not found" });
    }

    // Send a successful response with the retrieved category and its associated art items
    return res.status(200).send({ category });
  } catch (error) {
    // Handle any errors that occur during the retrieval process
    return res
      .status(500)
      .send({ error: "An error occurred while fetching the category" });
  }
};

/**
 * Get all collections and art items within a specific category.
 * @param {Object} req - The request object with the category ID as a parameter
 * @param {Object} res - The response object
 */

const getAllArtsInCategory = async (req, res) => {
  try {
    // Extract the category ID from the request parameters
    const categoryId = req.params.id;
    const batchSize = 20;
    
    // Find art items within the category
    const artsInCategory = await Category.findByPk(categoryId, {
      include: [{
        model: Art,
        order: sequelize.literal('RAND()'), // Order randomly
        limit: batchSize, // Limit the number of results
      }],
    });
    
    // If the category is not found, send a 404 response
    if (!artsInCategory) {
      return res.status(404).send({ error: "Category not found" });
    }

    // Extract the art objects from artsInCategory and remove unnecessary category info
    const artsOnly = artsInCategory.artworks || [];

    const checkArt = artsOnly.filter(art => {
      return (
        art.price !== null
        // Add additional conditions if needed
      );
    });
    
    // Send a successful response with art items
    return res.status(200).send({ checkArt });
  } catch (error) {
    // Handle any errors that occur during the retrieval process
    return res
      .status(500)
      .send({ error: "An error occurred while fetching the data" });
  }
};

const getAllCollectionsInCategory = async (req, res) => {
  try {
    // Extract the category ID from the request parameters
    const categoryId = req.params.id;
    const batchSize = 10;

    // Find collections within the category, including associated art items
    const collectionsInCategory = await Category.findByPk(categoryId, {
      include: [
        {
          model: Collection,
          as: "collections",
          order: sequelize.literal('RAND()'), // Order randomly
          limit: batchSize, // Limit the number of results
          include: [
            {
              model: Art,
              attributes: ["price"],
            },
          ],
        },
      ],
    });


    // If the category is not found, send a 404 response
    if (!collectionsInCategory) {
      return res.status(404).send({ error: "Category not found" });
    }

    // Calculate floor price and total collection revenue for each collection
    const collectionsWithStats = collectionsInCategory.collections.map(
      (collection) => {
        const artworks = collection.artworks || [];

        const floorPrice = artworks.reduce((minPrice, art) => {
          const price = parseFloat(art.price);
          return !isNaN(price) && price < minPrice ? price : minPrice;
        }, Number.MAX_SAFE_INTEGER);

        const totalRevenue = artworks.reduce((total, art) => {
          const price = parseFloat(art.price);
          return !isNaN(price) ? total + price : total;
        }, 0);

        return {
          ...collection.toJSON(),
          floor_price: floorPrice === Number.MAX_SAFE_INTEGER ? 0 : floorPrice,
          total_collection_revenue: totalRevenue,
        };
      }
    );

    // Send a successful response with collections and their stats
    return res.status(200).send({ collectionsWithStats });
  } catch (error) {
    // Handle any errors that occur during the retrieval process
    return res
      .status(500)
      .send({ error: "An error occurred while fetching the data" });
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
 * Create a new category.
 * @param {string} name - The name of the category.
 * @param {string} image - The image of the category.
 * @returns {object} - The category object.
 */

const createCategory = async (req, res) => {
  const { name } = req.body;
  // Check if the "name" field is empty or contains only whitespace
  if (!name || !req.file) {
    return res.status(400).json({success: false, message: "An error occurred while creating the category"});
  }

  try {
    // Create a URL-friendly slug for the category name
    let slug = createNameSlug(name);
    let counter = 1;

    // Ensure the slug is unique by appending a counter if needed
    while ((await Category.count({ where: { slug: slug } })) > 0) {
      counter++;
      slug = createNameSlug(name, counter);
    }

    // Get the image URL using the uploaded file from the request
    const result = await cloudinary.uploader.upload(req.file.path, { folder: "artsMarket" });

    // Create a new category in the database
    const category = await Category.create({
      name: name,
      image: result.secure_url,
      slug: slug,
    });

    // Send a successful response with the created category object
    res.status(200).send(category);
  } catch (error) {
    // Handle any errors that occur during the category creation process
    res.status(500).send({ message: error.message });
  }
};

/**
 * Delete a category by its ID.
 * @param {string} id - The ID of the category to be deleted.
 * @returns {string} - A message indicating that the category has been deleted.
 */
const deleteCategory = async (req, res) => {
  try {
    // Delete the category from the database based on its ID
    await Category.destroy({
      where: { id: req.params.id },
    });

    // Send a successful response indicating that the category has been deleted
    res.status(200).send("Category deleted");
  } catch (error) {
    // Handle any errors that occur during the category deletion process
    res.status(500).send({ message: error.message });
  }
};

const getAllCollectionsInCategoryForHeroSection = async (req, res) => {
  try {
    // Extract the category ID from the request parameters
    const categoryId = req.params.id;

    // Find collections within the category, including associated art items
    const collectionsInCategory = await Category.findByPk(categoryId, {
      include: [
        {
          model: Collection,
          as: "collections",
          include: [
            {
              model: Art,
              attributes: ["price"],
            },
            {
              model: Users, // Include the User model to access the user's name
              attributes: ["username"], // Include only the 'name' attribute
            },
          ],
        },
        
      ],
    });

    // If the category is not found, send a 404 response
    if (!collectionsInCategory) {
      return res.status(404).send({ error: "Category not found" });
    }

    // Calculate floor price and total collection revenue for each collection
    const collectionsWithStats = collectionsInCategory.collections.map(
      (collection) => {
        const artworks = collection.artworks || [];
       

        const floorPrice = artworks.reduce((minPrice, art) => {
          const price = parseFloat(art.price);
          return !isNaN(price) && price < minPrice ? price : minPrice;
        }, Number.MAX_SAFE_INTEGER);

        const totalRevenue = artworks.reduce((total, art) => {
          const price = parseFloat(art.price);
          return !isNaN(price) ? total + price : total;
        }, 0);

        return {
          ...collection.toJSON(),

          floor_price: floorPrice === Number.MAX_SAFE_INTEGER ? 0 : floorPrice,
          total_collection_revenue: totalRevenue,
        };
      }
    );

    // Send a successful response with collections and their stats
    return res.status(200).send({ collectionsWithStats });
  } catch (error) {
    // Handle any errors that occur during the retrieval process
    return res
      .status(500)
      .send({ error: "An error occurred while fetching the data" });
  }
};

module.exports = {
  getCategories,
  getAdminCategories,
  getCategoryById,
  createCategory,
  deleteCategory,
  getAllArtsInCategory,
  getAllCollectionsInCategory,
  getAllCollectionsInCategoryForHeroSection,
};
