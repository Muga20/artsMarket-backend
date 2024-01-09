const { body, validationResult } = require("express-validator");
const Users = require("../models/user/users");
const Roles = require("../models/user/roles");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { issueAccessToken } = require("../middleware/auth");
const SocialLinks = require("../models/user/socialLinks");
require("dotenv").config();

const bcrypt = require("bcrypt");
const path = require("path");

require("dotenv").config();
// this process.end lines of code are conceals information for the application stored in the .env file
const baseUrl = process.env.BASE_URL;
const host = process.env.HOST;
const port = process.env.PORT;
const secure = process.env.SECURE === "true";
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

// Function to send the registration link to the user's email
const sendRegistrationLinkToEmail = async (
  email,
  registrationToken,
  registrationTimestamp
) => {
  try {
    const transporter = nodemailer.createTransport({
      host: host,
      port: port,
      secure: secure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const registrationURL = `http://localhost:3000/account/profile?token=${registrationToken}&timestamp=${registrationTimestamp}`;

    const mailOptions = {
      from: smtpUser,
      to: email,
      subject: "Complete Registration",
      html: `
      <div className="bg-gray-900 p-4">
      <header className="text-white text-center text-2xl font-semibold">Arts Market</header>
      </div>
    
       <div className="p-6">
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-2xl font-semibold mb-2">Thank you for registering!</h2>
        <p className="text-base mb-4">Please click the link below to complete your registration:</p>
        <a style="color: #007bff; text-decoration: underline;" href="${registrationURL}">${registrationURL}</a>
      </div>
      </div>
    
      <div className="bg-gray-900 p-4 mt-4">
      <footer className="text-sm text-center text-gray-600 ">
         ArtMarket  All Rights Reserved.
      </footer>
      </div>
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending registration link:", error);
    throw new Error("Error sending registration link");
  }
};

const createSocialLinks = async (userId) => {
  try {
    // Create social links for the user with default values or customize as needed
    const socialLinks = await SocialLinks.create({
      userId: userId,
      facebook: "https://facebook.com",
      twitter: "https://twitter.com",
      instagram: "https://instagram.com",
      reddit: "https://reddit.com",
      pinterest: "https://pinterest.com",
    });

    return socialLinks;
  } catch (error) {
    console.error("Error creating social links:", error);
    throw new Error("Error creating social links");
  }
};

const register = async (req, res) => {
  try {
    // Validate and normalize the email field
    await body("email").isEmail().normalizeEmail().run(req);

    // Check if the 'firstName' field has a minimum length of 3 characters
    await body("firstName").isLength({ min: 3 }).run(req);

    // Check if the 'lastName' field has a minimum length of 3 characters
    await body("lastName").isLength({ min: 3 }).run(req);

    // Check if the 'username' field has a minimum length of 4 characters
    await body("username").isLength({ min: 4 }).run(req);

    // Check if the 'password' field has a minimum length of 6 characters
    await body("password").isLength({ min: 6 }).run(req);

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Destructure values from the request body
    const { email, role, firstName, lastName, username, password } = req.body;

    // Check if the email is already registered in the database
    const isEmailRegistered = await Users.findOne({
      where: {
        email: email,
      },
    });

    const isUsernameRegistered = await Users.findOne({
      where: {
        username: username,
      },
    });

    if (isEmailRegistered) {
      return res.status(409).json({ error: "Email already registered" });
    }

    if (isUsernameRegistered) {
      return res.status(402).json({ error: "Username has been registered" });
    }

    // Generate a registration timestamp and a registration token
    const registrationTimestamp = new Date(); // Current timestamp
    const registrationToken = crypto.randomBytes(32).toString("hex");

    // Initialize an empty array for user roles
    let roles = [];

    // If 'role' is provided, query the database for role information
    if (role) {
      roles = await Roles.findAll({
        where: {
          role: Array.isArray(role) ? role : [role],
        },
      });
    }

    // Query the database for the default user role ('user')
    let defaultRole = await Roles.findOne({
      where: {
        role: "user",
      },
    });

    // If defaultRole doesn't exist, create it
    if (!defaultRole) {
      defaultRole = await Roles.create({
        role: "user",
        role_number: 1,
      });
    }

    // Hash the user's password for storage
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user in the database
    const user = await Users.create({
      email,
      first_name: firstName,
      last_name: lastName,
      username,
      password: hashedPassword,
      registrationToken,
      registrationTimestamp,
      image: `${baseUrl}/${path.join(
        "Images",
        "blank-profile-picture-gab6c06e5a_1920.png"
      )}`,
      cover_photo: `${baseUrl}/${path.join(
        "Images",
        "blank-profile-picture-gab6c06e5a_1920.png"
      )}`,
    });


    const socialLinks = await createSocialLinks(user.id);

    // Set the user's roles based on the retrieved roles or defaultRole
    await user.setRoles(roles.length > 0 ? roles : [defaultRole]);

    // Retrieve the user's roles and extract role names
    const userRole = await user.getRoles();
    const roleNames = userRole.map((role) => role.role);

    // Issue access tokens for the user
    const tokens = issueAccessToken(
      user.id,
      user.email,
      user.registrationToken,
      roleNames
    );

    // Update the user's refreshToken in the database
    user.refreshToken = tokens.refreshToken;
    await user.save();

    // Send a registration link to the user's email (commented out)
    // await sendRegistrationLinkToEmail(email, registrationToken, registrationTimestamp);

    // Send a success response
    res.json({
      message: "User created successfully and registration link sent to email",
    });
  } catch (error) {
    // Handle any errors that occur during registration
    console.error("Error in register:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};


module.exports = {
  register,
};
