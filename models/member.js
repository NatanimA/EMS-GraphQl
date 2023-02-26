'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Member extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Member.belongsTo(models.Event, {
        foreignKey: 'eventId'
      })

      Member.belongsTo(models.User,{
        foreignKey: 'userId'
      })
    }
  }
  Member.init({
    eventId: {
      type: DataTypes.INTEGER,
      references: {
        model: {
          tableName: 'Events'
        },
        key: 'id'
      },
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      references:{
        model: {
          tableName: 'Users'
        },
        key: 'id'
      },
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Member',
  });
  return Member;
};
