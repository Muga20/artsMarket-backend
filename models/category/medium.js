const db = require("../../config/config");
const { DataTypes } = require("sequelize");


const Medium = db.define(
  "medium",
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

module.exports = Medium;
