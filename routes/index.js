const { searchUsersData } = require("../controller/search");
const { search } = require("../controller/AdminSearch");

const IndexRouter = require("express").Router();

IndexRouter.get("/search/:keyword", searchUsersData);
IndexRouter.get("/Admin-search/:keyword", search);

module.exports = IndexRouter;
