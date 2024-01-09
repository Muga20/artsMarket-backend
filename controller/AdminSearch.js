const { Op } = require("sequelize");
const Art = require("../models/art/art");
const User = require("../models/user/users");
const Tag = require("../models/tags/tags");
const Category = require("../models/category/category");
const Medium = require("../models/category/medium");

// Define a function to search for users, collections, and art based on a keyword
const search = async (req, res) => {
  // Extract the keyword from the request parameters
  const { keyword } = req.params;

  // Check if the keyword is provided; if not, return a 400 Bad Request response
  if (!keyword) {
    return res.status(400).json({ message: "Keyword is required for user search." });
  }

  try {
    // Define attributes to select for each category (user, collection, art)
    const userAttributes = ["username", "first_name", "last_name","id"];
    const categoryAttributes = ["name",];
    const tagAttributes = ["name",];
    const mediumAttributes = ["name",];
    const artAttributes = ["name","id"];

    // Define the limit for the number of results to return per category
    const limitPerCategory = 4;

    // Use Sequelize's findAll method to search for users with a username matching the keyword
    const userResult = await User.findAll({
      where: {
        username: { [Op.like]: `%${keyword}%` }, // Use SQL LIKE for partial matching
      },
      attributes: userAttributes, // Select specific attributes
      limit: limitPerCategory, // Limit the number of results
    });

    // Similar searches for collections and art
    const categoryResult = await Category.findAll({
      where: {
        name: { [Op.like]: `%${keyword}%` },
      },
      attributes: categoryAttributes,
      limit: limitPerCategory,
    });

    const tagResult = await Tag.findAll({
      where: {
        name: { [Op.like]: `%${keyword}%` },
      },
      attributes: tagAttributes,
      limit: limitPerCategory,
    });

    const mediumResult = await Medium.findAll({
      where: {
        name: { [Op.like]: `%${keyword}%` },
      },
      attributes: mediumAttributes,
      limit: limitPerCategory,
    });

    const artResult = await Art.findAll({
      where: {
        name: { [Op.like]: `%${keyword}%` },
      },
      attributes: artAttributes,
      limit: limitPerCategory,
    });

    // Respond with a JSON object containing the search results for each category
    res.status(200).json({ userResult, categoryResult, tagResult, mediumResult, artResult });
  } catch (error) {
    console.error(error);
    // Handle server errors by responding with a 500 status and an error message
    res.status(500).json({ message: "Error searching data" });
  }
};

// Export the searchUsersData function to be used as a route handler
module.exports = {
  search,
};



