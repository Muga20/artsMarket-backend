const Users = require("../models/user/users");
const UserRoles = require("../models/user/usersRoles");
const { body, validationResult } = require("express-validator");
require("dotenv").config();
const Roles = require("../models/user/roles");
const Earning = require("../models/Earning/CreatorEarning");
const bcrypt = require("bcrypt");
const cloudinary = require("cloudinary").v2;


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});


/**
 * This function is used to register a new user.
 * It accepts the following request body properties: eg first_name, last_name, email, password, and confirmPassword.
 * @returns {object} - Returns an object containing the newly created user data
 * @throws {object} - Returns an error object
 * @example
 * registerUser({
 *  first_name: "John",
 * last_name: "Doe",
 * email: "
 **/

const getUsers = async (req, res) => {
  try {
       // Extract page and pageSize from the request query parameters, defaulting to 1 and 10 respectively
     const page = parseInt(req.query.page);
     const pageSize = parseInt(req.query.pageSize);

       // Calculate the offset based on the page and pageSize
     const offset = (page - 1) * pageSize;

     const users = await Users.findAll({
      offset,
      limit: pageSize,
      include: [
        // Include the Roles model to fetch the user roles
        {
          model: Roles,
          through: "UserRoles",
        },
      ],
    }); // Fetch all users from the database
    res.status(200).send(users);
    // Return all users as JSON response to the client side application making the request to this API endpoint (route) with the GET method .
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getActiveAndDeActiveUsers = async (req, res) => {
  try {
    const users = await Users.findAll(); // Fetch all users from the database

    // Separate active and inactive users
    const activeUsers = users.filter((user) => user.isActive === true);
    const inactiveUsers = users.filter((user) => user.isActive === false);

    const responseData = {
      activeUsers: activeUsers,
      inactiveUsers: inactiveUsers,
    };

    res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const accessToken = req.user;
    const user_id = accessToken.userId.id;
    const user = await Users.findByPk(user_id, {
      // Fetch the user by primary key (id)
      include: [
        // Include the Roles model to fetch the user roles
        {
          model: Roles,
          through: "UserRoles",
        },
        {
          model: Earning,
          as: "creatorEarnings"
        },
      ],
    });

    if (user) {
      // Extract the role names from the user object
      const roleNames = user.roles.map((role) => role.role);

      const totalEarning = user.creatorEarnings.reduce(
        (total, totalAmount) => total + (parseFloat(totalAmount.amount) || 0), // Ensure valid numeric price
        0
      );

      res.json({ roleNames, user, totalEarning }); // Sending only the role names in the response and the user data
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const userById = async (req, res) => {
  const id = req.params.id;

  try {
    const user = await Users.findByPk(id, {
      // Fetch the user by primary key (id)
      include: [
        // Include the Roles model to fetch the user roles
        {
          model: Roles,
          through: "UserRoles",
        },
      ],
    });
    return res.status(201).send({ user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Define an asynchronous function called getVisitedUser that takes 'req' and 'res' parameters.
const getVisitedUser = async (req, res) => {
  try {
    // Attempt to find a user in the database by their primary key (ID) based on the 'id' parameter from the request.
    const user = await Users.findByPk(req.params.id);

    // Check if a user with the provided ID exists.
    if (user) {
      // If a user is found, respond with a JSON object containing the user data.
      res.json({ user });
    } else {
      // If no user is found, return a 404 Not Found response.
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    // Handle any errors that occur during the database query and respond with a 500 Internal Server Error along with the error message.
    res.status(500).json({ error: error.message });
  }
};

/*
This function is used to update the user data in the database. It is used for both updating the user profile and updating the user's role.
*/

const updateUser = async (req, res) => {
  try {
    const accessToken = req.user;

    const user_id = accessToken.userId.id;

    const user = await Users.findByPk(user_id);

    // Retrieve the user's existing data from the database
    const existingData = user.toJSON();

    // Update the user data with the fields provided in the request body
    const updatedData = {
      ...existingData, // Spread operator copies existingData into the new object so we don't lose any fields already in the database (like password, etc.) that we didn't include in the request body from the client side
      first_name: req.body.first_name || existingData.first_name,
      last_name: req.body.last_name || existingData.last_name,
      email: req.body.email || existingData.email,
      username: req.body.username || existingData.username,
      phone: req.body.phone || existingData.phone,
      gender: req.body.gender || existingData.gender,
      city: req.body.city || existingData.city,
      address: req.body.address || existingData.address,
      country: req.body.country || existingData.country,
      bio: req.body.bio || existingData.bio,
    };

    // Update the user record in the database with the new data
    await user.update(updatedData);

    res.json({ message: "User data updated successfully", data: updatedData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Define a function called getImageUrl that takes a 'req' (request) parameter.
const getImageUrl = (req) => {
  // Retrieve the base URL for serving images from the environment variables.
  // It is recommended to replace 'process.env.BASE_URL' with the actual base URL.
  const baseUrl = process.env.BASE_URL; // Replace with your base URL for serving images

  // Return a URL by combining the 'baseUrl' and the 'req.file.path'.
  // This assumes that 'req' contains a 'file' property with a 'path' attribute.
  return `${baseUrl}/${req.file.path}`;
};

// Define an asynchronous function called updateUserImages that takes 'req', 'res', and an optional 'isCoverPhoto' parameter.
const updateUserImages = async (req, res, isCoverPhoto = false) => {
  try {
    // Retrieve the user's token from the request object.
    const token = req.user;
    // Extract the user's ID from the token.
    const userId = token.userId.id;

    // Find the user in the database based on their ID.
    const user = await Users.findOne({ where: { id: userId } });

    // Check if the user exists; if not, return a 404 error.
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Determine the type of image to update based on the 'isCoverPhoto' flag.
    const imageType = isCoverPhoto ? "cover_photo" : "image";

    // Upload the image to Cloudinary.
    const result = await cloudinary.uploader.upload(req.file.path, { folder: "artsMarket" });
    const imageUrl = result.secure_url; // Get the secure URL of the uploaded image from Cloudinary

    // Create an object to hold the existing image data from the user record.
    const existingData = {
      image: user.image,
      cover_photo: user.cover_photo,
    };

    // Create an updated data object by combining the existing data with the new image URL.
    const updatedData = {
      ...existingData,
      [imageType]: imageUrl || existingData[imageType],
    };

    // Update the user's record in the database with the new image data.
    await user.update(updatedData, { where: { id: userId } });

    // Respond with a success message and the updated user data.
    res.status(200).json({ message: "User updated", updatedUser: updatedData });
  } catch (error) {
    // Handle any errors that occur during the update process and respond with a 500 status code.
    res.status(500).json({ error: error.message });
  }
};

/*
This function is used to update the user's profile image. It is used for both updating the user profile image and updating the user's cover photo.
*/

const replaceImages = async (req, res) => {
  await updateUserImages(req, res);
};

/*
This function is used to update the user's cover photo. It is used for both updating the user profile image and updating the user's cover photo.
*/

const replaceCoverImages = async (req, res) => {
  await updateUserImages(req, res, true);
};

/*
This function is used to update the user's password.
*/

// Define an asynchronous function called updatePassword that takes 'req' and 'res' parameters.
const updatePasswordAndEmail = async (req, res) => {
  // Retrieve the user's token from the request object.
  const token = req.user;
  // Extract the user's ID from the token.
  const userId = token.userId.id;
  // Extract the 'password' and 'confirmPassword' fields from the request body.
  const { password, confirmPassword, email } = req.body;

  // Check if the password and confirmPassword fields are empty.
  if (!password || !confirmPassword || !email) {
    // If either of the fields is empty, return a 400 Bad Request response.
    return res.status(400).json({
      success: false,
      message: "email, Password and Confirm Password are required",
    });
  }

  // Check if the password is less than 6 characters.
  if (password !== confirmPassword) {
    // If the password is less than 6 characters, return a 400 Bad Request response.
    return res.status(401).json({
      success: false,
      message: "Password Does Not Match",
    });
  }

  try {
    // Check if the email already exists in the database.
    const userWithEmail = await Users.findOne({ where: { email: email } });

    if (userWithEmail && userWithEmail.id !== userId) {
      // If a user with the same email exists and it's not the current user's email, return an error.
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Encrypt the password using bcrypt with a cost factor of 10.
    const encryptPassword = await bcrypt.hash(password, 10);

    // Update the user's password and email in the database.
    const updatedUser = await Users.update(
      {
        password: encryptPassword,
        email: email,
      },
      { where: { id: userId } }
    );

    // Respond with a 200 OK status and a success message along with the updated user data.
    res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    // Handle any errors that occur during the password update process and respond with an error message.
    res.status(500).json({ message: error.message });
  }
};

const Active = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await Users.findOne({ where: { id: id } });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "user not found" });
    }
    const updateStatus = await Users.update(
      { isActive: true },
      { where: { id: id } }
    );

    return res.status(200).json({ success: true, user: updateStatus });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const Deactivate = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await Users.findOne({ where: { id: id } });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "user not found" });
    }
    const updateStatus = await Users.update(
      { isActive: false },
      { where: { id: id } }
    );

    return res.status(200).json({ success: true, user: updateStatus });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const DeleteUserAcc = async (req, res) => {
  const accessToken = req.user;
  const user_id = accessToken.userId.id;


  try {
    const user = await Users.findOne({ where: { id: user_id } });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "user not found" });
    }

    const updateStatus = await Users.update(
      { isActive: false },
      { where: { id: user_id } }
    );

    return res.status(200).json({ success: true, user: updateStatus });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const checkRolesForAccessingSomeFunctionalities = async (req, res) => {
  try {
    const accessToken = req.user;
    const user_id = accessToken.userId.id;

    const user = await Users.findByPk(user_id, {
      // Fetch the user by primary key (id)
      include: [
        // Include the Roles model to fetch the user roles
        {
          model: Roles,
          through: "UserRoles",
        },
      ],
    });

    if (user) {
      // Extract the role names from the user object
      const roleNames = user.roles.map((role) => role.role);

      res.json({ roleNames, user }); // Sending only the role names in the response and the user data
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  replaceImages,
  updatePasswordAndEmail,
  replaceCoverImages,
  getVisitedUser,
  Active,
  Deactivate,
  getActiveAndDeActiveUsers,
  DeleteUserAcc,
  checkRolesForAccessingSomeFunctionalities,
  userById
};
