const db = require("../../config/config");
const { DataTypes } = require("sequelize");
const Art = require("../art/art");
const Medium = require("../category/medium");

const ArtMediums = db.define(
  "art_mediums",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    artwork_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    medium_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    freezeTableName: true,
  }
);

ArtMediums.belongsTo(Art, {
  foreignKey: "artwork_id",
  onDelete: "cascade",
  onUpdate: "cascade",
});

ArtMediums.belongsTo(Medium, { // Add this association
  foreignKey: "medium_id",
  onDelete: "cascade",
  onUpdate: "cascade",
});

Art.hasMany(ArtMediums, {
  foreignKey: "artwork_id",
  onDelete: "cascade",
  onUpdate: "cascade",
});

Medium.hasMany(ArtMediums, { 
  foreignKey: "medium_id",
  onDelete: "cascade",
  onUpdate: "cascade",
});


db.sync();

module.exports = ArtMediums;
