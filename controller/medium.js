const { body, validationResult } = require("express-validator");
const { createNameSlug } = require("../constants/slug");
const Medium = require("../models/category/medium");

/**
 * This gets all the Mediums
 * @returns {array} - The array of mediums
 */
const getMediums = async (req, res) => {
  try {
      // Extract page and pageSize from the request query parameters, defaulting to 1 and 10 respectively
      const page = parseInt(req.query.page);
      const pageSize = parseInt(req.query.pageSize);

      // Calculate the offset based on the page and pageSize
      const offset = (page - 1) * pageSize;

     // Retrieve all mediums from the database
     const mediums = await Medium.findAll({
      offset,
      limit: pageSize,
     });
    
    // Respond with a 200 OK status and the array of mediums
    res.status(200).send(mediums);
  } catch (error) {
    // Handle server errors by responding with a 500 status and an error message
    res.status(500).send({ message: error.message });
  }
};


const getMedium = async (req, res) => {
  try {
     // Retrieve all mediums from the database
     const mediums = await Medium.findAll({});

    // Respond with a 200 OK status and the array of mediums
    res.status(200).send({mediums});
  } catch (error) {
    console.log(error.message);
    // Handle server errors by responding with a 500 status and an error message
    res.status(500).send({ message: error.message });
  }
};

/**
 * This gets a single medium by its ID
 * @param {string} id - The ID of the medium
 * @returns {object} - The medium object
 */
const getMediumById = async (req, res) => {
  try {
    const id = req.params.id;

    // Find the medium by its ID, including associated arts
    const medium = await Medium.findByPk(id, {
      include: [{ model: Art, as: "art" }],
    });

    if (!medium) {
      // If the medium is not found, respond with a 404 status and an error message
      return res.status(404).send({ error: "Medium not found" });
    }

    // Respond with a 200 OK status and the medium object
    return res.status(200).send({ medium });
  } catch (error) {
    // Handle server errors by responding with a 500 status and an error message
    return res
      .status(500)
      .send({ error: "An error occurred while fetching the medium" });
  }
};

/**
 * This creates a new medium
 * @param {string} name - The name of the medium
 * @returns {object} - The medium object
 */
const createMedium = async (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({success: false, message: "An error occurred while creating the medium"});
  }

  try {
    // Generate a slug for the medium name and handle potential duplicate slugs
    let slug = createNameSlug(req.body.name);
    let counter = 1;

    while (await Medium.findOne({ where: { slug: slug } })) {
      counter++;
      slug = createNameSlug(req.body.name, counter);
    }

    // Create a new medium in the database
    const medium = await Medium.create({
      name,
      slug,
    });

    // Respond with a 201 Created status and the medium object
    return res.status(201).send({ medium });
  } catch (error) {
    // Handle server errors by responding with a 500 status and an error message
    return res
      .status(500)
      .send({ error: "An error occurred while creating the medium" });
  }
};

/**
 * This deletes a medium by its ID
 * @param {string} id - The ID of the medium
 * @returns {object} - The response message
 */
const deleteMedium = async (req, res) => {
  try {
    const id = req.params.id;

    // Find the medium by its ID
    const medium = await Medium.findByPk(id);

    if (!medium) {
      // If the medium is not found, respond with a 404 status and an error message
      return res.status(404).send({ error: "Medium not found" });
    }

    // Delete the medium from the database
    await medium.destroy();

    // Respond with a 200 OK status and a success message
    return res.status(200).send({ message: "Medium deleted successfully" });
  } catch (error) {
    // Handle server errors by responding with a 500 status and an error message
    return res
      .status(500)
      .send({ error: "An error occurred while deleting the medium" });
  }
};

// Export the functions to be used as route handlers
module.exports = {
  getMediums,
  getMedium,
  getMediumById,
  createMedium,
  deleteMedium,
};


