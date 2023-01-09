"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _sequelize = require("sequelize");
var _ditokokuSequelize = _interopRequireDefault(require("../connections/ditokoku-sequelize"));
var Genders = _ditokokuSequelize["default"].define('Genders', {
  // Model attributes are defined here
  id: {
    type: _sequelize.DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: _sequelize.DataTypes.STRING(50),
    allowNull: false
  },
  created_datetime: {
    type: _sequelize.DataTypes.DATE(3),
    allowNull: false,
    defaultValue: (0, _sequelize.fn)('NOW')
  },
  created_user_id: {
    type: _sequelize.DataTypes.INTEGER,
    allowNull: true
  },
  last_updated_datetime: {
    type: _sequelize.DataTypes.DATE(3),
    allowNull: false,
    defaultValue: (0, _sequelize.fn)('NOW')
  },
  last_updated_user_id: {
    type: _sequelize.DataTypes.INTEGER,
    allowNull: true
  },
  deleted_datetime: {
    type: _sequelize.DataTypes.DATE(3),
    allowNull: true
  },
  deleted_user_id: {
    type: _sequelize.DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'genders',
  timestamps: false,
  indexes: [{
    name: 'idx_genders_id',
    unique: true,
    fields: [{
      attribute: 'id',
      order: 'ASC'
    }]
  }, {
    name: 'idx_genders_name',
    unique: false,
    fields: [{
      attribute: 'name',
      order: 'ASC'
    }]
  }, {
    name: 'idx_genders_deleted_datetime',
    unique: false,
    fields: [{
      attribute: 'deleted_datetime',
      order: 'ASC'
    }]
  }]
});
exports["default"] = Genders;
//# sourceMappingURL=genders.js.map