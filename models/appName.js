const { DataTypes } = require("sequelize");
const db = require("../config/config");

const App = db.define(
  "app",
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
  },
  {
    freezeTableName: true,
  }
);

 db.sync();

module.exports = App;
