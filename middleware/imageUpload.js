const multer = require("multer");
const path = require("path");

// Define storage settings for uploaded images


// Create a multer instance with the defined storage settings and upload limits
const upload = multer({
  storage: multer.diskStorage({}),
  limits: { fileSize: '1000000' }, // Set a limit of 1MB for uploaded files
  fileFilter: (req, file, cb) => {
    // Define the allowed file types using regular expressions
    const fileTypes = /jpeg|jpg|png|webp/;
    
    // Check if the MIME type and file extension match the allowed types
    const mimeType = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(path.extname(file.originalname));

    if (mimeType && extname) {
      // If the file is of an allowed type, accept it
      return cb(null, true);
    }

    // If the file type is not allowed, reject it with an error message
    cb('Give proper file format to upload');
  }
}).single('image'); // Define that only a single file with the field name 'image' can be uploaded

// Export the 'upload' middleware for use in routes
module.exports = upload;