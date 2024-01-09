const { DataTypes } = require("sequelize");
const db = require("../../config/config");

const Tags = db.define(
  "tags",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    slug: {
      type: DataTypes.STRING,
    },
  },
  {
    freezeTableName: true,
  }
);

 db.sync();

module.exports = Tags;
