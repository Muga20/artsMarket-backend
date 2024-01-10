const db = require("../../config/config");
const Users = require("../user/users");
const { DataTypes } = require("sequelize");

const Art = db.define(
  "artworks",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    serial: {
      type: DataTypes.STRING,
    },
    name: {
      type: DataTypes.STRING,
    },

    slug: {
      type: DataTypes.STRING,
    },

    description: {
      type: DataTypes.TEXT,
    },

    category_id: {
      type: DataTypes.UUID,
    },

    image: {
      type: DataTypes.STRING,
    },

    price: {
      type: DataTypes.DECIMAL(10, 2),
    },

    collection_id: {
      type: DataTypes.UUID,
    },

    width: {
      type: DataTypes.INTEGER,
    },
    height: {
      type: DataTypes.INTEGER,
    },

    year: {
      type: DataTypes.STRING,
    },

    isExplicit: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    userId: {
      type: DataTypes.UUID,
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    freezeTableName: true,
  }
);

Art.belongsTo(Users, {
  foreignKey: "userId",
  as: "users",
  onDelete: "cascade",
  onUpdate: "cascade",
});

db.sync();

module.exports = Art;
