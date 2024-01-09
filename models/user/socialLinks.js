const { DataTypes } = require("sequelize");
const db = require("../../config/config");
const Users = require("../user/users");

const SocialLinks = db.define(
  "SocialLinks,",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.UUID,
    },

    facebook: {
      type: DataTypes.STRING,
    },

    twitter: {
      type: DataTypes.STRING,
    },

    instagram: {
      type: DataTypes.STRING,
    },

    reddit: {
      type: DataTypes.STRING,
    },

    pinterest: {
      type: DataTypes.STRING,
    },
  },
  {
    freezeTableName: true,
  }
);

SocialLinks.belongsTo(Users, { foreignKey: "userId" });
Users.hasOne(SocialLinks, { foreignKey: "userId" });

db.sync();

module.exports = SocialLinks;
