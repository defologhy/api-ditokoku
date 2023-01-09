"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _sequelize = require("sequelize");
var _ditokokuSequelize = _interopRequireDefault(require("../connections/ditokoku-sequelize"));
var Resellers = _ditokokuSequelize["default"].define('Resellers', {
  // Model attributes are defined here
  id: {
    type: _sequelize.DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: _sequelize.DataTypes.STRING(50),
    allowNull: false
  },
  full_name: {
    type: _sequelize.DataTypes.STRING(100),
    allowNull: true
  },
  phone_number: {
    type: _sequelize.DataTypes.STRING(20),
    allowNull: false
  },
  gender_id: {
    type: _sequelize.DataTypes.INTEGER,
    allowNull: true
  },
  password: {
    type: _sequelize.DataTypes.STRING(300),
    allowNull: false
  },
  image_filename: {
    type: _sequelize.DataTypes.STRING(300),
    allowNull: true
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
  tableName: 'resellers',
  timestamps: false,
  indexes: [{
    name: 'idx_resellers_id',
    unique: true,
    fields: [{
      attribute: 'id',
      order: 'ASC'
    }]
  }, {
    name: 'idx_resellers_username',
    unique: false,
    fields: [{
      attribute: 'username',
      order: 'ASC'
    }]
  }, {
    name: 'idx_resellers_full_name',
    unique: false,
    fields: [{
      attribute: 'full_name',
      order: 'ASC'
    }]
  }, {
    name: 'idx_resellers_phone_number',
    unique: false,
    fields: [{
      attribute: 'phone_number',
      order: 'ASC'
    }]
  }, {
    name: 'idx_resellers_gender_id',
    unique: false,
    fields: [{
      attribute: 'gender_id',
      order: 'ASC'
    }]
  }, {
    name: 'idx_resellers_deleted_datetime',
    unique: false,
    fields: [{
      attribute: 'deleted_datetime',
      order: 'ASC'
    }]
  }]
});
exports["default"] = Resellers;
//# sourceMappingURL=resellers.js.map