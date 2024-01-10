const { DataTypes } = require("sequelize");
const db = require("../../config/config");
const Tags = require("./tags");
const Art = require("../art/art");

const ArtsTag = db.define(
  "arts_tags",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    artId: {
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

ArtsTag.belongsTo(Tags, {
  foreignKey: "tagId",
  onDelete: "cascade",
  onUpdate: "cascade",
});

Tags.hasMany(ArtsTag, {
  foreignKey: "tagId",
  onDelete: "cascade",
  onUpdate: "cascade",
});

ArtsTag.belongsTo(Art, {
  foreignKey: "artId",
  onDelete: "cascade",
  onUpdate: "cascade",
});

Art.hasMany(ArtsTag, {
  foreignKey: "artId",
  onDelete: "cascade",
  onUpdate: "cascade",
});

 db.sync();

module.exports = ArtsTag;
