const { body, validationResult } = require("express-validator");
const App = require("../models/appName");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});



/**
 * This gets all the Tags
 * @returns {array} - The array of tags
 */

// Define an asynchronous function called getTags that takes 'req' and 'res' parameters.
const getApp = async (req, res) => {
  try {
     const app = await App.findAll({ });

    res.status(200).send({app});
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

/**
 *  This gets all the Arts  using a single tag
 * @param {string} id - The id of the tag
 * @returns {object} - The tag object
 
 * */

const getAppById = async (req, res) => {
  try {
    const id = req.params.id;

    const app = await App.findByPk(id, {});

    if (!app) {
      return res.status(404).send({ error: "Art not found" });
    }

    return res.status(200).send({ app });
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

const createApp = async (req, res) => {
  try {

    const { name } = req.body;
    if (!name) {
      return res.status(400).send({ error: "name must be included" });
    }

    if (!req.file) {
        return res.status(400).json({success: false, message: "image in not inserted"});
      }
  
      // Ensure that the image variable is correctly populated
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "artsMarket" });


    const app = await App.create({
      name: name,
      image:  result.secure_url,
    });

    return res.status(201).send({ app });
  } catch (error) {
    return res.status(500).send({ error: error.message });
  }
};


const EditApp = async (req, res) => {
    const id = req.params.id;
  
    try {
      const { name} = req.body;

      if (req.file) {
        // If a new image is provided, update the medicine_image field
        const result = await cloudinary.uploader.destroy('image.public_id');
        const updatedImage = await cloudinary.uploader.upload(req.file.path, { folder: "artsMarket" });
        updateFields = updatedImage.secure_url;
      }

      const updatedApp = await App.update( {
            name: name,
            image: updateFields,
        }, { where: { id: id } }
      );
  
      return res.status(201).send({ app: updatedApp });
    } catch (error) {
      return res.status(500).send({ error: error.message });
    }
  };

  
  const deleteApp = async (req, res) => {
    try {
      const id = req.params.id;
      const app = await App.findByPk(id);

      if (!app) {
        return res.status(404).send({ error: "app not found" });
      }
      await app.destroy();
  
      return res.status(200).send({ message: "app deleted successfully" });
    } catch (error) {
      // Handle server errors by responding with a 500 status and an error message
      return res
        .status(500)
        .send({ error: "An error occurred while deleting the medium" });
    }
  };


module.exports = {
  getApp,
  getAppById,
  createApp,
  EditApp,
  deleteApp
};
