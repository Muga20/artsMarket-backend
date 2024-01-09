// Inside "category.js"
const { DataTypes } = require("sequelize");
const db = require("../../config/config");
const Art = require("../art/art");
const Collection = require("../collection/collection");

const Category = db.define(
  "categories",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
    },
    image: {
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

Category.hasMany(Art, {
  foreignKey: "category_id",
});

Art.belongsTo(Category, {
  foreignKey: "category_id",
});

Category.hasMany(Collection, {
  foreignKey: "CategoryId",
  onDelete: "cascade",
  onUpdate: "cascade",
});

Collection.belongsTo(Category, {
  foreignKey: "CategoryId",
  onDelete: "cascade",
  onUpdate: "cascade",
});

// db.sync();

module.exports = Category;
