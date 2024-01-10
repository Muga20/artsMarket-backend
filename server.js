const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./config/config");
require("dotenv").config();
const limiter = require("./middleware/requestRateLimit");

const AuthRouter = require("./routes/auth");
const UserRoute = require("./routes/users");
const CollectionRouter = require("./routes/collection");
const CategoryRouter = require("./routes/category");
const MediumRouter = require("./routes/medium");
const ArtRoutes = require("./routes/art");
const TagRoutes = require("./routes/tags");
const IndexRouter = require("./routes/index");
const http = require("http");


// Create an Express application
const app = express();
const PORT = process.env.EXP_PORT;
const server = http.createServer(app);


// Middleware for parsing request bodies here:
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(limiter);


// Serve static files from the React app
 app.use("/Images", express.static("./Images"));


// Create an HTTP server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});


// Test DB connection
db.authenticate()
  .then(() => {
    console.log("Database connection has been established successfully!");
  })

  // Catch error 
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });

// Routes

app.use("/auth", AuthRouter);
app.use("/user", UserRoute);
app.use("/collection", CollectionRouter);
app.use("/category", CategoryRouter);
app.use("/medium", MediumRouter);
app.use("/art", ArtRoutes);
app.use("/tags", TagRoutes);
app.use("/index", IndexRouter);
