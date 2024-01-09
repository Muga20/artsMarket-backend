const db = require("../../config/config");
const Art = require("../art/art");
const Users = require("../user/users");
const Earning = require("../Earning/CreatorEarning");
const { DataTypes } = require("sequelize");

const Collection = db.define(
  "collections",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.UUID,
    },

    image: {
      type: DataTypes.STRING,
    },

    cover_photo: {
      type: DataTypes.STRING,
    },

    CategoryId: {
      type: DataTypes.UUID,
    },

    name: {
      type: DataTypes.STRING,
    },

    description: {
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

Collection.belongsTo(Users, {
  foreignKey: "userId",
  onDelete: "cascade",
  onUpdate: "cascade",
});

Users.hasMany(Collection, {
  foreignKey: "userId",
  onDelete: "cascade",
  onUpdate: "cascade",
});

Collection.hasMany(Art, {
  foreignKey: "collection_id",
  onDelete: "cascade",
  onUpdate: "cascade",
});

Collection.hasMany(Earning, {
  foreignKey: "collection_id",
  onDelete: "cascade",
  onUpdate: "cascade",
});

Art.belongsTo(Collection, {
  foreignKey: "collection_id",
  onDelete: "cascade",
  onUpdate: "cascade",
});

 db.sync();

module.exports = Collection;
