const { body, validationResult } = require("express-validator");
const { createNameSlug } = require("../constants/slug");
const Tags = require("../models/tags/tags");
const Art = require("../models/art/art");
const Collection = require("../models/collection/collection");
const CollectionTags = require("../models/tags/collectionTag");
const sequelize = require("sequelize");

/**
 * This gets all the Tags
 * @returns {array} - The array of tags
 */

// Define an asynchronous function called getTags that takes 'req' and 'res' parameters.
const getTags = async (req, res) => {
  try {
       // Extract page and pageSize from the request query parameters, defaulting to 1 and 10 respectively
      const page = parseInt(req.query.page);
      const pageSize = parseInt(req.query.pageSize);
   
      // Calculate the offset based on the page and pageSize
      const offset = (page - 1) * pageSize;

     // Attempt to retrieve all tags from the database using the 'Tags' model.
     const tags = await Tags.findAll({
      offset,
      limit: pageSize,
     });

    // Respond with a 200 OK status and send the retrieved tags as a JSON response.
    res.status(200).send(tags);
  } catch (error) {
    // Handle any errors that occur during the database query and respond with a 500 Internal Server Error along with the error message.
    res.status(500).send({ message: error.message });
  }
};

/**
 *  This gets all the Arts  using a single tag
 * @param {string} id - The id of the tag
 * @returns {object} - The tag object
 
 * */

const getTagById = async (req, res) => {
  try {
    const id = req.params.id;

    const tag = await Tags.findByPk(id, {
      include: [{ model: Art, as: "art" }],
    });

    if (!tag) {
      return res.status(404).send({ error: "Art not found" });
    }

    return res.status(200).send({ tag });
  } catch (error) {
    return res
      .status(500)
      .send({ error: "An error occurred while fetching the tag" });
  }
};

/**
 * This gets all the Arts  using a single tag
 * @param {string} id - The id of the tag
 * @returns {object} - The tag object
 */
const getCollectionByTag = async (req, res) => {
  try {
    const id = req.params.id;

    const tag = await Tags.findByPk(id, {
      include: [{ model: Art, as: "art" }],
    });

    if (!tag) {
      return res.status(404).send({ error: "Art not found" });
    }

    return res.status(200).send({ tag });
  } catch (error) {
    return res
      .status(500)
      .send({ error: "An error occurred while fetching the tag" });
  }
};

/**
 * This creates a new tag
 *  @param {string} name - The name of the tag
 * @returns {object} - The tag object
 *  */

const createTag = async (req, res) => {
  try {
    body("name").notEmpty().withMessage("Tag name is required");

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }

    const { name } = req.body;

    let slug = createNameSlug(name);
    let counter = 1;

    while (await Tags.findOne({ where: { slug: slug } })) {
      counter++;
      slug = createNameSlug(name, counter);
    }

    if (!name || !slug || name.trim() === "") {
      return res.status(400).send({ error: "Tag name must be included" });
    }

    const tag = await Tags.create({
      name: name,
      slug: slug,
    });

    return res.status(201).send({ tag });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};

const deleteTag = async (req, res) => {
  try {
    const id = req.params.id;

    const tag = await Tags.findByPk(id);

    if (!tag) {
      return res.status(404).send({ error: "Tag not found" });
    }

    await tag.destroy();

    return res.status(200).send({ message: "Tag deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .send({ error: "An error occurred while deleting the tag" });
  }
};






const getAllCollectionsByTag = async (req, res) => {
  try {
    const batchSize = 10;

    const tags = await Tags.findAll({
      attributes: ['name'], // Retrieve only the 'name' attribute from the Tags model
      include: [
        {
          model: CollectionTags,
          order: sequelize.literal('RAND()'), // Order randomly
          limit: batchSize,
          include: {
            model: Collection,
            order: sequelize.literal('RAND()'), // Add this line to order the Collection records randomly
            include: [
              {
                model: Art,
                attributes: ['price'],
              },
            ],
          },
        },
      ],
    });

    if (!tags) {
      return res.status(404).send({ error: "Tags not found" });
    }

    // Calculate floor price and total revenue for each collection within each tag
    const tagsWithStats = tags.map((tag) => {
      const collections = tag.collection_tags.map((collectionTag) => {
        const collection = collectionTag.collection;
        const artworks = collection.artworks || [];

        const floorPrice = artworks.reduce((minPrice, art) => {
          const price = parseFloat(art.price);
          return price && price < minPrice ? price : minPrice;
        }, Number.MAX_SAFE_INTEGER);

        // Filter out collections with a floor price of 0
        if (floorPrice > 0) {
          const totalRevenue = artworks.reduce((total, art) => {
            const price = parseFloat(art.price);
            return price ? total + price : total;
          }, 0);

          return {
            name: collection.name,
            image: collection.image, // Include the image attribute
            cover_photo: collection.cover_photo, // Include the cover photo attribute
            id:collection.id,
            otherDetails: collection.OtherCollectionDetails, // Include other collection details
            floor_price: floorPrice === Number.MAX_SAFE_INTEGER ? 0 : floorPrice,
            total_collection_revenue: totalRevenue,
          };
        }
        return null;
      });

      const filteredCollections = collections.filter(Boolean); // Filter out null entries (collections with floor price 0)

      // Exclude tags with no non-zero floor price collections
      if (filteredCollections.length > 0) {
        return {
          name: tag.name,
          collections: filteredCollections,
        };
      }
      return null;
    });

    const filteredTags = tagsWithStats.filter(Boolean); // Filter out null entries (tags with no non-zero floor price collections)

    return res.status(200).send({ filteredTags });
  } catch (error) {
    return res
      .status(500)
      .send({ error: "An error occurred while fetching the tags" });
  }
};


module.exports = {
  getTags,
  getTagById,
  createTag,
  getCollectionByTag,
  deleteTag,
  getAllCollectionsByTag,
};
