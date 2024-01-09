const db = require("../../config/config");


const { DataTypes } = require("sequelize");

const creatorEarning = db.define(
  "creatorEarnings",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
    },
    collection_id: {
        type: DataTypes.UUID,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
    },
  },
  {
    freezeTableName: true,
  }
);



// db.sync();

module.exports = creatorEarning;
