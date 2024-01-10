const db = require("../../config/config");
const ArtId = require("./artRefferenceId");
const Users = require("../user/users");
const { DataTypes } = require("sequelize");

const ArtOwnership  = db.define(
  "artownership",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
     referenceId: {
      type: DataTypes.UUID,
    },
    userId: {
      type: DataTypes.UUID,
    },
    ownerShip_status: {
        type: DataTypes.STRING,
    },
    transaction_date: {
      type: DataTypes.DATE,
    },
  },
  {
    freezeTableName: true,
  }
);

ArtOwnership.belongsTo(Users, {
  foreignKey: "userId",
  as: "users",
  onDelete: "cascade",
  onUpdate: "cascade",
});

ArtOwnership.belongsTo(ArtId, {
    foreignKey: "referenceId",
    as: "artRefferenceId",
    onDelete: "cascade",
    onUpdate: "cascade",
  });
  
db.sync();

module.exports = ArtOwnership;
