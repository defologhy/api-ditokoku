"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;
var _sequelize = require("sequelize");
var _ditokokuSequelize = _interopRequireDefault(require("../connections/ditokoku-sequelize"));
var ConfigurationBalanceBonus = _ditokokuSequelize["default"].define('ConfigurationBalanceBonus', {
  // Model attributes are defined here
  id: {
    type: _sequelize.DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  amount: {
    type: _sequelize.DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  minimum_amount_sales_order: {
    type: _sequelize.DataTypes.DECIMAL(20, 2),
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
  tableName: 'configuration_balance_bonus',
  timestamps: false,
  indexes: [{
    name: 'idx_configuration_balance_bonus_id',
    unique: true,
    fields: [{
      attribute: 'id',
      order: 'ASC'
    }]
  }, {
    name: 'idx_configuration_balance_bonus_deleted_datetime',
    unique: false,
    fields: [{
      attribute: 'deleted_datetime',
      order: 'ASC'
    }]
  }]
});
exports["default"] = ConfigurationBalanceBonus;
//# sourceMappingURL=configuration-balance-bonus.js.map