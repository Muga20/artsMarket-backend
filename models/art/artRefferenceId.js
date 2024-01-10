const db = require("../../config/config");
const { DataTypes } = require("sequelize");
const Art = require("./art");


const ArtRefferenceId = db.define(
  "artRefferenceId",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    art_Id: {
      type: DataTypes.UUID,
    },
  },
  {
    freezeTableName: true,
  }
);

ArtRefferenceId.belongsTo(Art, {
  foreignKey: "art_Id",
  as: "art",
  onDelete: "cascade",
  onUpdate: "cascade",
});

db.sync();

module.exports = ArtRefferenceId;
