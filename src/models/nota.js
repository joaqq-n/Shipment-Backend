'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Nota extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Nota.init({
    contenido: DataTypes.TEXT,
    creado: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Nota',
  });
  return Nota;
};