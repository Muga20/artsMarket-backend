const db = require("../../config/config");
const Users = require("../user/users");
const { DataTypes } = require("sequelize");
const Art = require("./art");

const ArtsLike = db.define(
  "likes",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
    },
    artId: {
      type: DataTypes.UUID,
    },
  },
  {
    freezeTableName: true,
  }
);

ArtsLike.belongsTo(Users, {
  foreignKey: "userId",
  as: "user",
  onDelete: "cascade",
  onUpdate: "cascade",
});

ArtsLike.belongsTo(Art, {
  foreignKey: "artId",
  as: "art",
  onDelete: "cascade",
  onUpdate: "cascade",
});

Art.hasMany(ArtsLike, {
  foreignKey: "artId",
  as: "likes",
  onDelete: "cascade",
  onUpdate: "cascade",
});

Users.hasMany(ArtsLike, {
  foreignKey: "userId",
  as: "likes",
  onDelete: "cascade",
  onUpdate: "cascade",
});

// db.sync();

module.exports = ArtsLike;
