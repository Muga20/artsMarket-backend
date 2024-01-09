const { ImageAnnotatorClient } = require("@google-cloud/vision");
const vision = new ImageAnnotatorClient();
const multer = require("multer");

// Define multer storage settings to store uploaded image in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Define a middleware function to check image content
const checkImageContent = async (req, res, next) => {
  try {
    // Check if no image file is provided in the request
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided." });
    }

    // Convert the uploaded image buffer to a base64 string
    const imageContent = req.file.buffer.toString("base64");

    // Create an image object for Google Cloud Vision API
    const image = {
      content: imageContent,
    };

    // Perform safe search detection on the image using the Vision API
    const [result] = await vision.safeSearchDetection(image);

    // Extract safe search annotations from the result
    const safeSearch = result.safeSearchAnnotation;

    // Check if the image contains explicit or harmful content
    if (
      safeSearch.adult === "LIKELY" ||
      safeSearch.adult === "VERY_LIKELY" ||
      safeSearch.violence === "LIKELY" ||
      safeSearch.violence === "VERY_LIKELY"
    ) {
      // If explicit or harmful content is detected, return a 403 Forbidden response
      return res
        .status(403)
        .json({ error: "Image contains explicit or harmful content." });
    }

    // If the image is safe, proceed to the next middleware or route
    next();
  } catch (error) {
    // Handle errors by logging and responding with a 500 Internal Server Error
    console.error("Error checking image content:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Export the middleware for handling file uploads with multer
module.exports = upload.single("image");