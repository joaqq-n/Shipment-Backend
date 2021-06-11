'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Finanza extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Finanza.init({
    id_embarque: DataTypes.INTEGER,
    estado: DataTypes.STRING,
    total: DataTypes.NUMERIC,
    descripcion: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Finanza',
  });
  return Finanza;
};