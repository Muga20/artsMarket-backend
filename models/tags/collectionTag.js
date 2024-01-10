const { DataTypes } = require("sequelize");
const db = require("../../config/config");
const Tags = require("./tags");
const Collection = require("../collection/collection");

const CollectionTags = db.define(
  "collection_tags",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    collectionId: {
      type: DataTypes.UUID,
    },
    tagId: {
      type: DataTypes.UUID,
    },
  },
  {
    freezeTableName: true,
  }
);

CollectionTags.belongsTo(Tags, {
  foreignKey: "tagId",
  onDelete: "cascade",
  onUpdate: "cascade",
});

Tags.hasMany(CollectionTags, {
  foreignKey: "tagId",
  onDelete: "cascade",
  onUpdate: "cascade",
});

CollectionTags.belongsTo(Collection, {
  foreignKey: "collectionId",
  onDelete: "cascade",
  onUpdate: "cascade",
});

Collection.hasMany(CollectionTags, {
  foreignKey: "collectionId",
  onDelete: "cascade",
  onUpdate: "cascade",
});

db.sync();

module.exports = CollectionTags;
